export type MIDI_Json = string;

export type Genre = {
  id: number;
  name: string;
};

export type GenreWithSongs = Genre & {
  songs: Song[];
};

export type Song = {
  id: number;
  type: 'solo' | 'duet';
  name: string;
  genre: Genre;
};

export type SongWithContent = Song & {
  content: MIDI_Json;
};
