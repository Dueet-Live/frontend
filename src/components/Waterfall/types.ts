import { Note } from '../../types/MidiJSON';

export type KeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  whiteKeyWidth: number;
  blackKeyWidth: number;
};

export type MidiInfo = {
  bpm: number;
  beatsPerBar: number;
  noteDivision: number;
  notes: Array<Note>;
};
