import { Note } from '../../types/MidiJSON';

export type TraditionalKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  whiteKeyWidth: number;
  blackKeyWidth: number;
};

export type SmartKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  keyWidth: number;
};

export type MidiInfo = {
  bpm: number;
  beatsPerBar: number;
  noteDivision: number;
  notes: Array<Note>;
};
