import { InstrumentName } from 'soundfont-player';
import { AudioPlayer } from './AudioPlayer';
import Instrument from './Instrument';

export default class InstrumentPlayer {
  audioPlayer: AudioPlayer;
  instrument: Instrument;

  constructor(defaultVolume?: number) {
    this.audioPlayer = new AudioPlayer(defaultVolume);
    this.instrument = new Instrument(this.audioPlayer);
  }

  setInstrument(instrumentName: InstrumentName) {
    this.audioPlayer.setInstrument(instrumentName);
  }

  playNoteWithDuration(
    note: number,
    time: number,
    duration: number,
    volume: number
  ) {
    return this.audioPlayer.playNoteWithDuration(note, time, duration, volume);
  }

  playNote(note: number) {
    this.instrument.playNote(note);
  }

  stopNote(note: number) {
    this.instrument.stopNote(note);
  }
}
