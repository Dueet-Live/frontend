import { MidiJSON, Note, Track } from '../types/MidiJSON';

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

/** Returns a copy of `song` that is `factor` times faster. */
export const changeSongSpeed = (song: MidiJSON, factor: number) => {
  // deep copy
  const songCopy: MidiJSON = JSON.parse(JSON.stringify(song));
  songCopy.header.tempos[0].bpm = Math.round(
    songCopy.header.tempos[0].bpm * factor
  );
  songCopy.tracks = songCopy.tracks.map(track =>
    Object.assign({}, track, {
      notes: changeNotesTimeInfo(track.notes, factor),
    })
  );
  return songCopy;
};

const changeNotesTimeInfo = (notes: Note[], factor: number): Note[] => {
  return notes.map(note =>
    Object.assign({}, note, {
      duration: note.duration / factor,
      time: note.time / factor,
    })
  );
};
