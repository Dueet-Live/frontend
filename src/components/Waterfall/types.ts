export type Note = {
  time: number;
  duration: number;
  midi: number;
  velocity: number;
};

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
