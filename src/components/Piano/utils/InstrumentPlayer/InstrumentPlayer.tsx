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

  playNotes(notes: string[]) {
    this.instrument.playNotes(notes);
  }
}