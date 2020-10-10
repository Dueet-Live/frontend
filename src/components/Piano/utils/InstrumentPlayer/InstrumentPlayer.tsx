import { InstrumentName } from 'soundfont-player';
import { List } from 'lodash';
import { AudioPlayer } from './AudioPlayer';
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

  playNotes(notes: List<string>) {
    this.instrument.playNotes(notes);
  }
}
