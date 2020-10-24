import { Note, Track } from '../types/MidiJSON';

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
