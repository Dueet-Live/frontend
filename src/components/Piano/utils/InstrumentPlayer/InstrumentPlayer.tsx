import { InstrumentName } from 'soundfont-player';
import { AudioPlayer } from './AudioPlayer';
import Instrument from './Instrument';

export default class InstrumentPlayer {
  audioPlayer: AudioPlayer;
  instrument: Instrument;

  constructor() {
    this.audioPlayer = new AudioPlayer();
    this.audioPlayer.setInstrument('acoustic_grand_piano');
    this.instrument = new Instrument(this.audioPlayer);
  }

  setInstrument(instrumentName: InstrumentName) {
    this.audioPlayer.setInstrument(instrumentName);
  }

  playNotes(notes: string[]) {
    this.instrument.playNotes(notes);
  }

  startPlayNote(note: number) {
    this.instrument.startPlayNote(note.toString());
  }

  stopPlayNote(note: number) {
    this.instrument.stopPlayNote(note.toString());
  }
}
