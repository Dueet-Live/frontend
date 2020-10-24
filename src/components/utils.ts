import { MidiJSON, Note } from '../types/MidiJSON';

/** Returns a copy of `song` that is `factor` times faster. */
export const changeSongSpeed = (song: MidiJSON, factor: number) => {
  const songCopy = Object.assign({}, song);
  songCopy.header.tempos[0].bpm *= factor;
  songCopy.tracks = songCopy.tracks.map(track =>
    Object.assign({}, track, {
      notes: changeNotesTimeInfo(track.notes, factor),
    })
  );
  return changeSongSpeed;
};

const changeNotesTimeInfo = (notes: Note[], factor: number): Note[] => {
  return notes.map(note =>
    Object.assign({}, note, {
      duration: note.duration * factor,
      time: note.time * factor,
    })
  );
};
