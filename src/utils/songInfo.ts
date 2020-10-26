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
  const smartNotes: SmartNote[] = notes.map(note => {
    return Object.assign({}, note, {
      ...notes,
      smartKey: Math.floor(Math.random() * Math.floor(7)), // TODO: find the corresponding key
    });
  });

  return smartNotes;
};

// TODO
export const getSmartMappingChangeEvents = (
  notes: Note[]
): SmartMappingChangeEvent[] => {
  return [
    { time: 0, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 1, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 2, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 3, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 4, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 5, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 6, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 7, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 8, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 9, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 10, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 11, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 12, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 13, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 14, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 15, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 16, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 17, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 18, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 19, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 20, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 21, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 22, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 23, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 24, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 25, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 26, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 27, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 27, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 29, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 30, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 31, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 32, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 33, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 34, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 35, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 36, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 37, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 38, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 39, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 40, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 41, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 42, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 43, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 44, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 45, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 46, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 47, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 48, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 49, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 50, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 51, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 52, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 53, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 54, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 55, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 56, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 57, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 58, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 59, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 60, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 61, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 62, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 63, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 64, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 65, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 66, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 67, mapping: [72, 73, 74, 75, 76, 77, 78] },
    { time: 68, mapping: [60, 61, 62, 63, 64, 65, 66] },
    { time: 69, mapping: [72, 73, 74, 75, 76, 77, 78] },
  ];
};
