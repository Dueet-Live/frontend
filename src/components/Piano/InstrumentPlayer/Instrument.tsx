import { difference } from '../utils/arrayHelpers';
import { Player } from 'soundfont-player';
import { NullSoundFontPlayerNoteAudio, AudioPlayer } from './AudioPlayer';

export default class Instrument {
  audioPlayer: AudioPlayer;
  activeNoteMap: { [key: string]: Player | NullSoundFontPlayerNoteAudio };

  constructor(audioPlayer: AudioPlayer) {
    this.audioPlayer = audioPlayer;
    this.activeNoteMap = {};
  }

  playNotes(activeNotes: string[]) {
    this.stopPlayingInactiveNotes(activeNotes);
    this.startPlayingNewlyActiveNotes(activeNotes);
  }

  stopPlayingInactiveNotes(activeNotes: string[]) {
    const previouslyActiveNotes = this.getActiveNotes();
    const inactiveNotes = difference(previouslyActiveNotes, activeNotes);

    inactiveNotes.forEach(note => {
      this.activeNoteMap[note].stop();
      // console.log("Stop " + note);
      delete this.activeNoteMap[note];
    });
  }

  startPlayingNewlyActiveNotes(activeNotes: string[]) {
    const previouslyActiveNotes = this.getActiveNotes();
    const newlyActiveNotes = difference(activeNotes, previouslyActiveNotes);

    newlyActiveNotes.forEach(note => {
      this.activeNoteMap[note] = this.audioPlayer.playNote(parseInt(note));
    });
  }

  playNote(note: number) {
    if (note.toString() in this.activeNoteMap) {
      return;
    }
    this.activeNoteMap[note.toString()] = this.audioPlayer.playNote(note);
  }

  stopNote(note: number) {
    if (!(note.toString() in this.activeNoteMap)) {
      return;
    }
    this.activeNoteMap[note.toString()].stop();
    delete this.activeNoteMap[note.toString()];
  }

  getActiveNotes() {
    return Object.keys(this.activeNoteMap);
  }
}
