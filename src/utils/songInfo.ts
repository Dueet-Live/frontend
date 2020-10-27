import { Note, SmartNote, Track } from '../types/MidiJSON';

export const calculateSongDuration = (tracks: Track[]): number => {
  const endTimestamps = tracks
    .flatMap(track => track.notes)
    .map(note => note.time + note.duration);
  return Math.max(...endTimestamps);
};

export const getPlaybackNotes = (
  tracks: Track[],
  playbackChannel: number
): Note[] => {
  return tracks
    .filter(track => track.channel === playbackChannel)
    .flatMap(track => track.notes);
};

type SmartMapping = number[];
export type SmartMappingChangeEvent = {
  time: number;
  mapping: SmartMapping;
};

// TODO
export const getSmartNotes = (
  notes: Note[],
  changeEvents: SmartMappingChangeEvent[]
): SmartNote[] => {
  // TODO: remove hard coded map
  const map: { [note: number]: number } = {
    60: 6,
    63: 1,
    65: 3,
    67: 4,
    68: 4,
    70: 6,
    72: 0,
    73: 1,
    75: 2,
    77: 3,
    79: 4,
    80: 5,
  };
  const smartNotes: SmartNote[] = notes.map(note => {
    return Object.assign({}, note, {
      ...notes,
      smartKey: map[note.midi] || Math.floor(Math.random() * Math.floor(7)),
    });
  });

  return smartNotes;
};

// TODO
export const getSmartMappingChangeEvents = (
  notes: Note[]
): SmartMappingChangeEvent[] => {
  const map: { [note: number]: { start: number; end: number }[] } = {};
  notes.forEach(note => {
    if (!(note.midi in map)) {
      map[note.midi] = [];
    }
    map[note.midi].push({ start: note.time, end: note.time + note.duration });
  });
  console.log(map);
  // TODO: remove hard coded events
  return [
    { time: 0, mapping: [72, 63, 75, 65, 68, 80, 70] },
    { time: 10, mapping: [72, 63, 75, 77, 68, 80, 70] },
    { time: 20, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 46, mapping: [72, 63, 75, 77, 68, 80, 70] },
    { time: 48.5, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 62, mapping: [72, 63, 75, 77, 68, 80, 70] },
    { time: 67, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 69.8, mapping: [72, 73, 75, 77, 79, 80, 70] },
    { time: 72.8, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 77.7, mapping: [72, 73, 75, 77, 79, 80, 70] },
    { time: 79.3, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 85.8, mapping: [72, 73, 75, 77, 79, 80, 70] },
    { time: 88.5, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 100, mapping: [72, 63, 75, 65, 68, 80, 70] },
    { time: 109, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 118.3, mapping: [72, 73, 75, 77, 79, 80, 70] },
    { time: 120.8, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 125.8, mapping: [72, 73, 75, 77, 79, 80, 70] },
    { time: 127.3, mapping: [72, 73, 75, 77, 68, 80, 70] },
    { time: 150, mapping: [72, 63, 75, 65, 67, 80, 70] },
    { time: 160, mapping: [72, 63, 75, 77, 68, 80, 60] },
  ];
};
