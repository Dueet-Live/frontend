import * as Tone from 'tone';
import { Note } from '../../../types/MidiJSON';
import { isEqual } from '../../../utils/setHelpers';
import { Score } from '../types';
import getNotesAtTimeFromNotes from '../utils/getNotesAtTimeFromNotes';

export default class ScoreManager {
  private isGameEnded: boolean;
  private pressedNotes: Set<number>;
  private prevIndexInMIDI: number;
  private startTime: number;
  private playerNotes: Note[];
  private setScore: (update: (prevScore: Score) => Score) => void;
  private scoreHandler?: NodeJS.Timeout;

  constructor(
    startTime: number,
    playerNotes: Note[],
    setScore: (update: (prevScore: Score) => Score) => void
  ) {
    this.isGameEnded = false;
    this.pressedNotes = new Set<number>();
    this.prevIndexInMIDI = 0;
    this.startTime = startTime;
    this.playerNotes = playerNotes;
    this.setScore = setScore;
  }

  didPlayNote(note: number) {
    this.pressedNotes.add(note);
  }

  didStopNote(note: number) {
    this.pressedNotes.delete(note);
  }

  didEndGame() {
    this.isGameEnded = true;
  }

  startChecking() {
    const scoreHandler = setInterval(() => {
      // stop updating score if game has ended
      if (this.isGameEnded) {
        clearInterval(scoreHandler);
        return;
      }
      this.check();
    }, 500);
    this.scoreHandler = scoreHandler;
  }

  cleanup() {
    if (this.scoreHandler !== undefined) {
      clearInterval(this.scoreHandler);
    }
  }

  private check() {
    // game has not started, so don't increment score yet
    if (Tone.now() - this.startTime < 0) {
      return;
    }

    const currentlyPressed = new Set(this.pressedNotes);

    // get set of notes that should be pressed right now from playerNotes
    const [correctNotes, index] = getNotesAtTimeFromNotes(
      Tone.now() - this.startTime,
      this.playerNotes,
      this.prevIndexInMIDI
    );

    this.prevIndexInMIDI = index;

    const passed = isEqual(currentlyPressed, correctNotes);
    // if both sets of notes are equal
    this.setScore((prevScore: Score) => ({
      correct: prevScore.correct + (passed ? 1 : 0),
      total: prevScore.total + 1,
    }));
  }
}
