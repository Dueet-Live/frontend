export type Note = {
  time: number;
  duration: number;
  midi: number;
  velocity: number;
};

type TempoEvent = {
  ticks: number;
  bpm: number;
  time?: number;
};

type TimeSignatureEvent = {
  ticks: number;
  timeSignature: number[];
  measures?: number;
};

export type MidiJSON = {
  // the transport and timing data
  header: {
    tempos: TempoEvent[]; // the tempo, e.g. 120
    timeSignatures: TimeSignatureEvent[]; // the time signature, e.g. [4, 4],
  };

  // an array of midi tracks
  tracks: [
    {
      smallStartNote: number;
      regularStartNote: number;
      channel: number;
      notes: Note[];
    }
  ];
};
