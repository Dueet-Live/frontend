import * as Tone from 'tone';
import { Player } from 'tone';
import { Note } from '../../../types/MidiJSON';
import InstrumentPlayer from '../../Piano/InstrumentPlayer';
import { NullSoundFontPlayerNoteAudio } from '../../Piano/InstrumentPlayer/AudioPlayer';
import { Score } from '../types';
import FeedbackManager from './FeedbackManager';
import ScoreManager from './ScoreManager';

export default class GameManager {
  private startTime: number;
  private delayedStartTime: number;
  private audioHandlers: (Player | NullSoundFontPlayerNoteAudio)[];
  private didPlayNote?: (key: number, playerId: number) => void;
  private didStopNote?: (key: number, playerId: number) => void;

  // Managers
  private scoreManager?: ScoreManager;
  feedbackManager?: FeedbackManager;

  constructor(
    didPlayNote?: (key: number, playerId: number) => void,
    didStopNote?: (key: number, playerId: number) => void
  ) {
    this.startTime = -1;
    this.delayedStartTime = -1;
    this.audioHandlers = [];

    this.didPlayNote = didPlayNote;
    this.didStopNote = didStopNote;
  }

  // Must set up game before start scheduling the various events
  setUpGame(
    setStartTime: (value: React.SetStateAction<number>) => void,
    lookAheadTime: number,
    countDown: number
  ) {
    this.startTime = Tone.now() + countDown;
    this.delayedStartTime = this.startTime + lookAheadTime;
    setStartTime(this.startTime);
    console.log('Game start', this.startTime);
    Tone.Transport.start();
  }

  scheduleCountDown(
    countDown: number,
    setTimeToStart: (value: React.SetStateAction<number>) => void
  ) {
    for (let i = 0; i < countDown; i++) {
      Tone.Transport.schedule(() => {
        setTimeToStart(countDown - 1 - i);
      }, this.startTime - (countDown - 1 - i) - Tone.now());
    }
  }

  schedulePlaybackAudio(
    instrumentPlayer: InstrumentPlayer,
    playbackNotes: Note[]
  ) {
    instrumentPlayer.setInstrument('acoustic_grand_piano');
    playbackNotes.forEach(note => {
      Tone.Transport.schedule(() => {
        const handler = instrumentPlayer.playNoteWithDuration(
          note.midi,
          note.time + this.delayedStartTime,
          note.duration,
          note.velocity
        );
        this.audioHandlers.push(handler);
        // Schedule 1 sec before the note play
      }, note.time + this.delayedStartTime - Tone.now() - 1);
    });
  }

  setUpScoreManager(
    playerNotes: Note[],
    setScore: (update: (prevScore: Score) => Score) => void
  ) {
    this.scoreManager = new ScoreManager(
      this.delayedStartTime,
      playerNotes,
      setScore
    );
    this.scoreManager.startChecking();
  }

  scheduleEndingScreen(songDuration: number, endGame: () => void) {
    Tone.Transport.schedule(() => {
      endGame();
      this.scoreManager?.didEndGame();
      this.feedbackManager?.didEndGame();
      // Slightly delay the ending screen
    }, this.delayedStartTime + songDuration - Tone.now() + 0.1);
  }

  setUpFeedbackManager(playerNotes: Note[], isSmartPiano: boolean) {
    this.feedbackManager = new FeedbackManager(
      this.delayedStartTime,
      playerNotes
    );
    this.feedbackManager.startTrackingMissedNotes(isSmartPiano);
  }

  handleNotePlay(note: number, playedBy: number, myPlayerId: number) {
    if (playedBy === myPlayerId) {
      this.scoreManager?.didPlayNote(note);
    }
    this.didPlayNote && this.didPlayNote(note, playedBy);
  }

  handleNoteStop(note: number, playedBy: number, myPlayerId: number) {
    if (playedBy === myPlayerId) {
      this.scoreManager?.didStopNote(note);
    }
    this.didStopNote && this.didStopNote(note, playedBy);
  }

  cleanup() {
    Tone.Transport.cancel();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.audioHandlers.forEach(handler => {
      handler.stop();
    });
    this.scoreManager?.cleanup();
  }

  // TODO: schedule keyboard volume change
}
