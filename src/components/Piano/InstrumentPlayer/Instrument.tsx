import { Player } from 'soundfont-player';
import { NullSoundFontPlayerNoteAudio, AudioPlayer } from './AudioPlayer';

export default class Instrument {
  audioPlayer: AudioPlayer;
  activeNoteMap: { [key: string]: Player | NullSoundFontPlayerNoteAudio };

  constructor(audioPlayer: AudioPlayer) {
    this.audioPlayer = audioPlayer;
    this.activeNoteMap = {};
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
}
