/** Returns a copy of `song` that is `factor` times faster. */
export const changeSongSpeed = (song: any, factor: number) => {
  const songCopy = Object.assign({}, song);
  songCopy.header.tempos[0].bpm *= factor;
  songCopy.tracks = songCopy.tracks.map((track: any) =>
    Object.assign({}, track, {
      notes: changeNotesTimeInfo(track.notes, factor),
    })
  );
  return changeSongSpeed;
};

const changeNotesTimeInfo = (notes: any, factor: number) => {
  return notes.map((note: any) =>
    Object.assign({}, note, {
      duration: note.duration * factor,
      time: note.time * factor,
    })
  );
};
