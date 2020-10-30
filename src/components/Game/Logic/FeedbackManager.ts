import * as Tone from 'tone';
import { NotificationContextProps } from '../../../contexts/NotificationContext';
import { Note } from '../../../types/MidiJSON';

type MarkedNote = Note & {
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
  private showFeedback: NotificationContextProps;

  // Used for scoring played notes
  private standardMidiMap: MarkedNotesMidiMap = {};
  // Used for detecting missed notes
  private standardIndexMap: MarkedNotesIndexMap = {};
  // Currently pressed notes (key: midi, value: time)
  private playingNotes: { [midi: number]: number } = {};
  // Maximum total difference (error tolerance)
  private DIFF_THRESHOLD: number = 0.5;

  private WRONG = 0;
  private BAD = 1;
  private GOOD = 2;
  private GREAT = 3;
  private PERFECT = 4;
  private MISSED = 5;

  private feedback = ['Wrong', 'Bad', 'Good', 'Great', 'Perfect', 'Missed'];

  private stats = Array(6).fill(0);

  constructor(
    startTime: number,
    playerNotes: Note[],
    showFeedback: NotificationContextProps
  ) {
    this.startTime = startTime;
    this.playerNotes = playerNotes;
    this.showFeedback = showFeedback;
    this.initialiseNoteMaps();
  }

  private initialiseNoteMaps() {
    this.playerNotes.forEach((note, index) => {
      const noteCopy = Object.assign({}, note, {
        isPlayed: false,
      });
      if (!(note.midi in this.standardMidiMap)) {
        this.standardMidiMap[note.midi] = {
          prevIndex: 0,
          notes: [],
        };
      }
      this.standardMidiMap[note.midi].notes.push(noteCopy);
      this.standardIndexMap[index] = noteCopy;
    });
  }

  startTrackingMissedNotes() {
    this.playerNotes.forEach((note, index) => {
      // (DIFF_THRESHOLD)s after note start / note stop time, whichever is earlier
      const { time, duration, midi } = note;
      const checkTime =
        this.getMissCheckTime(time, duration) + this.startTime - Tone.now();
      Tone.Transport.schedule(() => {
        // Criterion: a note is considered missed if
        // - it is not currently being played
        // - it is not played before at the check time
        if (
          !this.standardIndexMap[index].isPlayed &&
          !(midi in this.playingNotes)
        ) {
          // TODO: UI feedback
          // console.log('Missed', note.midi, Tone.now() - this.startTime);
          this.showFeedback({
            message: this.feedback[this.MISSED],
            severity: 'error',
          });
          this.stats[this.MISSED]++;
        }
      }, checkTime);
    });
  }

  // Return time relative to start time
  private getMissCheckTime(time: number, duration: number) {
    return time + Math.min(this.DIFF_THRESHOLD, duration);
  }

  didPlayNote(note: number) {
    console.log('Start', note, Tone.now() - this.startTime);
    this.playingNotes[note] = Tone.now() - this.startTime;
  }

  didStopNote(note: number) {
    const noteStopTime = Tone.now() - this.startTime;
    const noteStartTime = this.playingNotes[note];
    console.log('Stop', note, noteStopTime);
    if (!(note in this.playingNotes)) {
      console.log(
        'Error, found note stop without corresponding note start event'
      );
      return;
    }

    const performance = this.measurePerformance(
      note,
      noteStartTime,
      noteStopTime
    );

    this.showFeedbackToUI(performance);
    delete this.playingNotes[note];
  }

  private measurePerformance(
    midi: number,
    keyDownTime: number,
    keyUpTime: number
  ) {
    // This note should not appear in this piece, wrong note played
    if (!(midi in this.standardMidiMap)) {
      this.stats[this.WRONG]++;
      return this.WRONG;
    }
    const { prevIndex, notes } = this.standardMidiMap[midi];

    // A note is matched if it overlaps with the note played by the user,
    // it is not missed (see missed note criterion),
    // and the total difference in keyup and keydown is at most DIFF_THRESHOLD
    // If multiple matching notes are found, we take the note with minimum total difference
    let bestPerform = this.WRONG;
    let bestPerformIndex = -1;
    for (let i = prevIndex; i < notes.length; i++) {
      const note = notes[i];
      const { time: startTime, duration, isPlayed } = note;
      const stopTime = startTime + duration;
      if (
        keyUpTime >= startTime &&
        keyDownTime <= stopTime &&
        keyDownTime <= this.getMissCheckTime(startTime, duration) &&
        !isPlayed
      ) {
        const performance = this.compareWithStandardNote(
          keyDownTime,
          keyUpTime,
          startTime,
          stopTime
        );
        this.stats[performance]++;
        this.standardMidiMap[midi].notes[i].isPlayed = true;
        if (performance > bestPerform) {
          bestPerform = performance;
          bestPerformIndex = i;
        }
      }

      // Find the first note that start after current time, start from this index next time
      if (keyUpTime < startTime) {
        this.standardMidiMap[midi].prevIndex = i;
        break;
      }
    }

    // Cannot find any matching notes (probably hits wrong notes)
    if (bestPerformIndex === -1) {
      this.stats[this.WRONG]++;
      return this.WRONG;
    }

    return bestPerform;
  }

  // 0: bad (treated as wrong note); 1: not bad, 2: good, 3: great, 4: perfect
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
    if (diff <= 0.15) {
      return this.PERFECT;
    }
    if (diff <= 0.3) {
      return this.GREAT;
    }
    if (diff <= this.DIFF_THRESHOLD) {
      return this.GOOD;
    }
    return this.BAD;
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

  private showFeedbackToUI(performance: number) {
    // TODO: UI feedback
    // console.log('Performance', note, performance);

    // Do not show feedback for wrong and bad notes
    if (performance === this.WRONG || performance === this.BAD) {
      return;
    }

    this.showFeedback({
      message: this.feedback[performance],
      severity: 'success',
    });
  }

  generateStats() {
    return {
      wrong: this.stats[this.WRONG],
      bad: this.stats[this.BAD],
      good: this.stats[this.GOOD],
      great: this.stats[this.GREAT],
      perfect: this.stats[this.PERFECT],
      missed: this.stats[this.MISSED],
      total: this.playerNotes.length,
    };
  }
}
