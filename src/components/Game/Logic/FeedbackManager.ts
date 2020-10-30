import * as Tone from 'tone';
import { Note } from '../../../types/MidiJSON';
import { NoteFeedback } from '../utils/NoteFeedback';

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
  showFeedback?: (note: number, performance: NoteFeedback) => void;

  // Used for scoring played notes
  private standardMidiMap: MarkedNotesMidiMap = {};
  // Used for detecting missed notes
  private standardIndexMap: MarkedNotesIndexMap = {};
  // Currently pressed notes (key: midi, value: time)
  private playingNotes: { [midi: number]: number } = {};
  // Maximum total difference (error tolerance)
  private DIFF_THRESHOLD: number = 0.5;

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

  // This is only used for note feedback as it can be slightly inaccurate at times
  // Actual update of stats is in `didStopNote`
  startTrackingMissedNotes() {
    this.playerNotes.forEach((note, index) => {
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
          this.showFeedbackToUI(midi, NoteFeedback.MISSED);
        }
      }, checkTime);
    });
  }

  // Return time relative to start time
  private getMissCheckTime(time: number, duration: number) {
    // (DIFF_THRESHOLD)s after note start / note stop time, whichever is earlier
    return time + Math.min(this.DIFF_THRESHOLD, duration);
  }

  didPlayNote(note: number) {
    this.playingNotes[note] = Tone.now() - this.startTime;
  }

  didStopNote(note: number) {
    const noteStopTime = Tone.now() - this.startTime;
    const noteStartTime = this.playingNotes[note];
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

    this.showFeedbackToUI(note, performance);
    delete this.playingNotes[note];
  }

  didEndGame() {
    // Mark all unmarked notes as missed
    for (let i = 0; i < this.playerNotes.length; i++) {
      const note = this.standardIndexMap[i];
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
    if (!(midi in this.standardMidiMap)) {
      this.stats[NoteFeedback.WRONG]++;
      return NoteFeedback.WRONG;
    }
    const { prevIndex, notes } = this.standardMidiMap[midi];

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
        this.standardMidiMap[midi].prevIndex = i;
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
        this.standardMidiMap[midi].notes[i].isPlayed = true;
        if (performance > bestPerform) {
          bestPerform = performance;
          bestPerformIndex = i;
        }
      } else {
        // Mark missed notes
        // Update the stats here, because there is slight inaccuracy in the scheduling
        if (!isMissed) {
          this.stats[NoteFeedback.MISSED]++;
          this.standardMidiMap[midi].notes[i].isMissed = true;
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
    if (diff <= 0.15) {
      return NoteFeedback.PERFECT;
    }
    if (diff <= 0.3) {
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

  private showFeedbackToUI(note: number, performance: NoteFeedback) {
    // UI not set up yet
    if (this.showFeedback === undefined) {
      return;
    }

    this.showFeedback(note, performance);
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
