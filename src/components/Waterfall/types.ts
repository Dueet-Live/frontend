export type Note = {
  time: number;
  duration: number;
  midi: number;
};

export type SongInfo = {
  bpm: number;
  beatsPerBar: number; // TODO: add info about whether beat = half/quarter/eigth note etc.
  smallStartNote: number;
  regularStartNote: number;
  notes: Array<Note>;
};
