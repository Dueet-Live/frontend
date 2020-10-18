import localforage from 'localforage';
import { Genre, Song } from '../types/song';

export const GENRES = 'genres';
export const SONGS = 'songs';

export async function getGenres() {
  const genres: Genre[] | null = await localforage.getItem(GENRES);

  if (genres === null) {
    return [];
  }

  return genres;
}

export async function getSongs(type: 'solo' | 'duet', genre?: string) {
  const songs: Song[] | null = await localforage.getItem(SONGS);

  if (songs === null) {
    return [];
  }

  return songs.filter(
    song => song.type === type && (!genre || song.genre.name === genre)
  );
}

export async function getSong(id: number | undefined) {
  if (id === undefined) return null;

  const songs: Song[] | null = await localforage.getItem(SONGS);

  if (songs === null) {
    return null;
  }

  const song = songs.find(song => song.id === id);

  if (song === undefined) return null;

  return song;
}
