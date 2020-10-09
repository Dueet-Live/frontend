import { InstrumentName } from 'soundfont-player';
import AudioPlayer from './AudioPlayer';
import Instrument from './Instrument';

export default class InstrumentPlayer {
  audioPlayer: AudioPlayer;
  instrument: Instrument;

  constructor() {
    this.audioPlayer = new AudioPlayer();
    this.instrument = new Instrument(this.audioPlayer);
  }

  setInstrument(instrumentName: InstrumentName) {
    this.audioPlayer.setInstrument(instrumentName);
  }

  playNotes(notes: Int32Array) {
    this.instrument.playNotes(notes);
  }
}
