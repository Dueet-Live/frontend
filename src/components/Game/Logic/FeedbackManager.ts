import * as Tone from 'tone';
import { Note } from '../../../types/MidiJSON';
import { NoteFeedbackAreaHandleRef } from '../../Piano/types/noteFeedback';
import { getIndexedNotesFromNotes } from '../../Waterfall/utils';
import { NoteFeedback } from '../utils/NoteFeedback';

type PlayingNote = {
  startTime: number;
  keyIdentifier: number;
};

type MarkedNote = Note & {
  isMissed: boolean;
  isPlayed: boolean;
};

type MarkedNotesMidiMap = {
  [midi: number]: MarkedNoteMap;
};

type MarkedNoteMap = {
  prevIndex: number; // Pointer to keep track which notes are already marked
  notes: MarkedNote[];
};

type MarkedNotesIndexMap = {
  [index: number]: MarkedNote;
};

export default class FeedbackManager {
  private startTime: number;
  private playerNotes: Note[];
  private handlers: { [keyIdentifier: number]: NoteFeedbackAreaHandleRef } = {};

  // Used for scoring played notes
  private standardNoteMapByMidi: MarkedNotesMidiMap = {};
  // Used for detecting missed notes
  private standardNoteMapByIndex: MarkedNotesIndexMap = {};
  // Currently pressed notes (key: midi, value: time)
  private playingNotes: { [midi: number]: PlayingNote } = {};
  // Maximum total difference (error tolerance)
  private DIFF_THRESHOLD: number = 0.4;

  private stats = Array(6).fill(0);

  constructor(startTime: number, playerNotes: Note[]) {
    this.startTime = startTime;
    this.playerNotes = playerNotes;
    this.initialiseNoteMaps();
  }

  private initialiseNoteMaps() {
    this.playerNotes.forEach((note, index) => {
      const noteCopy = Object.assign({}, note, {
        isPlayed: false,
        isMissed: false,
      });
      if (!(note.midi in this.standardNoteMapByMidi)) {
        this.standardNoteMapByMidi[note.midi] = {
          prevIndex: 0,
          notes: [],
        };
      }
      this.standardNoteMapByMidi[note.midi].notes.push(noteCopy);
      this.standardNoteMapByIndex[index] = noteCopy;
    });
  }

  registerHandler(keyIdentifier: number, handler: NoteFeedbackAreaHandleRef) {
    this.handlers[keyIdentifier] = handler;
  }

  unregisterHandler(keyIdentifier: number) {
    delete this.handlers[keyIdentifier];
  }

  // This is only used for note feedback as it can be slightly inaccurate at times
  // Actual update of stats is in `didStopNote`
  // TODO: get indexed notes for traditional piano as well
  startTrackingMissedNotes() {
    const indexedNotes = getIndexedNotesFromNotes(this.playerNotes);
    indexedNotes.forEach((note, noteIndex) => {
      const { time, duration, index: keyIdentifier } = note;
      const { midi } = this.playerNotes[noteIndex];
      const checkTime =
        this.getMissCheckTime(time, duration) + this.startTime - Tone.now();
      Tone.Transport.schedule(() => {
        // Criterion: a note is considered missed if
        // - it is not currently being played
        // - it is not played before at the check time
        if (
          !this.standardNoteMapByIndex[noteIndex].isPlayed &&
          !(midi in this.playingNotes)
        ) {
          this.showFeedbackToUI(keyIdentifier, NoteFeedback.MISSED);
        }
      }, checkTime);
    });
  }

  // Return time relative to start time
  private getMissCheckTime(time: number, duration: number) {
    // (DIFF_THRESHOLD)s after note start / note stop time, whichever is earlier
    return time + Math.min(this.DIFF_THRESHOLD, duration);
  }

  didPlayNote(midi: number, keyIdentifier: number) {
    this.playingNotes[midi] = {
      startTime: Tone.now() - this.startTime,
      keyIdentifier,
    };
  }

  didStopNote(midi: number, keyIdentifier: number) {
    if (!(midi in this.playingNotes)) {
      console.log(
        'Error, found note stop without corresponding note start event'
      );
      return;
    }

    const noteStopTime = Tone.now() - this.startTime;
    const {
      startTime: noteStartTime,
      keyIdentifier: keyboardIndex,
    } = this.playingNotes[midi];

    if (keyIdentifier !== keyboardIndex) {
      console.log(
        'Error, found note stop has different key identifier with the corresponding note start event'
      );
      return;
    }

    const performance = this.measurePerformance(
      midi,
      noteStartTime,
      noteStopTime
    );

    this.showFeedbackToUI(keyboardIndex, performance);
    delete this.playingNotes[midi];
  }

  didEndGame() {
    // Mark all unmarked notes as missed
    for (let i = 0; i < this.playerNotes.length; i++) {
      const note = this.standardNoteMapByIndex[i];
      if (!note.isMissed && !note.isPlayed) {
        this.stats[NoteFeedback.MISSED]++;
        note.isMissed = true;
      }
    }
  }

  private measurePerformance(
    midi: number,
    keyDownTime: number,
    keyUpTime: number
  ) {
    // This note should not appear in this piece, wrong note played
    if (!(midi in this.standardNoteMapByMidi)) {
      this.stats[NoteFeedback.WRONG]++;
      return NoteFeedback.WRONG;
    }
    const { prevIndex, notes } = this.standardNoteMapByMidi[midi];

    // A note is matched if it overlaps with the note played by the user,
    // it is not missed (see missed note criterion),
    // If multiple matching notes are found, we take the note with minimum total difference
    let bestPerform = NoteFeedback.WRONG;
    let bestPerformIndex = -1;
    for (let i = prevIndex; i < notes.length; i++) {
      const note = notes[i];
      const { time: startTime, duration, isPlayed, isMissed } = note;
      const stopTime = startTime + duration;

      // Find the first note that start after current time, start from this index next time
      if (keyUpTime < startTime) {
        this.standardNoteMapByMidi[midi].prevIndex = i;
        break;
      }

      if (
        keyDownTime <= stopTime &&
        keyDownTime <= this.getMissCheckTime(startTime, duration) &&
        keyUpTime >= startTime &&
        !isPlayed &&
        !isMissed
      ) {
        const performance = this.compareWithStandardNote(
          keyDownTime,
          keyUpTime,
          startTime,
          stopTime
        );
        this.stats[performance]++;
        this.standardNoteMapByMidi[midi].notes[i].isPlayed = true;
        if (performance > bestPerform) {
          bestPerform = performance;
          bestPerformIndex = i;
        }
      } else {
        // Mark missed notes
        // Update the stats here, because there is slight inaccuracy in the scheduling
        if (!isMissed) {
          this.stats[NoteFeedback.MISSED]++;
          this.standardNoteMapByMidi[midi].notes[i].isMissed = true;
        }
      }
    }

    // Cannot find any matching notes (probably hits wrong notes)
    if (bestPerformIndex === -1) {
      this.stats[NoteFeedback.WRONG]++;
      return NoteFeedback.WRONG;
    }

    return bestPerform;
  }

  private compareWithStandardNote(
    actualStartTime: number,
    actualStopTime: number,
    expectedStartTime: number,
    expectedStopTime: number
  ) {
    const diff = this.calculateTotalDifference(
      actualStartTime,
      actualStopTime,
      expectedStartTime,
      expectedStopTime
    );
    if (diff <= 0.1) {
      return NoteFeedback.PERFECT;
    }
    if (diff <= 0.25) {
      return NoteFeedback.GREAT;
    }
    if (diff <= this.DIFF_THRESHOLD) {
      return NoteFeedback.GOOD;
    }
    return NoteFeedback.BAD;
  }

  private calculateTotalDifference(
    actualStartTime: number,
    actualStopTime: number,
    expectedStartTime: number,
    expectedStopTime: number
  ) {
    return (
      Math.abs(expectedStartTime - actualStartTime) +
      Math.abs(expectedStopTime - actualStopTime)
    );
  }

  private showFeedbackToUI(keyIdentifier: number, feedback: NoteFeedback) {
    // UI handlers not set up yet
    if (!(keyIdentifier in this.handlers)) {
      return;
    }

    // Hide wrong/good feedback
    if (feedback === NoteFeedback.WRONG || feedback === NoteFeedback.GOOD) {
      return;
    }

    const handler = this.handlers[keyIdentifier];
    handler.current?.enqueueFeedback(feedback);
  }

  // TODO: if needed in ending screen
  generateStats() {
    return {
      missed: this.stats[NoteFeedback.MISSED],
      wrong: this.stats[NoteFeedback.WRONG],
      bad: this.stats[NoteFeedback.BAD],
      good: this.stats[NoteFeedback.GOOD],
      great: this.stats[NoteFeedback.GREAT],
      perfect: this.stats[NoteFeedback.PERFECT],
      total: this.playerNotes.length,
    };
  }
}
