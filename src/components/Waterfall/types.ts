import { Note, SmartNote } from '../../types/MidiJSON';

export type TraditionalKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  whiteKeyWidth: number;
  blackKeyWidth: number;
};

export type SmartKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  keyWidth: number;
};

type BasicMidiInfo = {
  bpm: number;
  beatsPerBar: number;
  noteDivision: number;
};

export type MidiInfo = BasicMidiInfo & {
  notes: Note[];
};

export type SmartMidiInfo = BasicMidiInfo & {
  notes: SmartNote[];
};
