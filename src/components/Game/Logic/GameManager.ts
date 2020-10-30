import * as Tone from 'tone';
import { Player } from 'tone';
import { NotificationContextProps } from '../../../contexts/NotificationContext';
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
  private feedbackManager?: FeedbackManager;

  constructor() {
    this.startTime = -1;
    this.delayedStartTime = -1;
    this.audioHandlers = [];
  }

  // Must set up game before start scheduling the various events
  setUpGame(
    setStartTime: (value: React.SetStateAction<number>) => void,
    lookAheadTime: number,
    countDown: number,
    didPlayNote?: (key: number, playerId: number) => void,
    didStopNote?: (key: number, playerId: number) => void
  ) {
    this.startTime = Tone.now() + countDown;
    this.delayedStartTime = this.startTime + lookAheadTime;
    setStartTime(this.startTime);
    console.log('Game start', this.startTime);
    Tone.Transport.start();

    this.didPlayNote = didPlayNote;
    this.didStopNote = didStopNote;
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
          // TODO: this should be done in the JSON file
          note.velocity * 0.5
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
      console.log(this.feedbackManager?.generateStats());
      // Slightly delay the ending screen
    }, this.delayedStartTime + songDuration - Tone.now() + 0.1);
  }

  setUpFeedbackManager(
    playerNotes: Note[],
    showFeedback: NotificationContextProps
  ) {
    this.feedbackManager = new FeedbackManager(
      this.delayedStartTime,
      playerNotes,
      showFeedback
    );
    this.feedbackManager.startTrackingMissedNotes();
  }

  handleNotePlay(note: number, playedBy: number, myPlayerId: number) {
    if (playedBy === myPlayerId) {
      this.feedbackManager?.didPlayNote(note);
      this.scoreManager?.didPlayNote(note);
    }
    this.didPlayNote && this.didPlayNote(note, playedBy);
  }

  handleNoteStop(note: number, playedBy: number, myPlayerId: number) {
    if (playedBy === myPlayerId) {
      this.feedbackManager?.didStopNote(note);
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
