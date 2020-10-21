import { useEffect, useState } from 'react';
import { Song } from '../types/song';
import localforage, { SONGS } from './extendedLocalForage';

export default function useSong(id: number | undefined) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    let songSubscription: Subscription;

    async function setupHook() {
      await localforage.ready();
      const songObservable = localforage.getItemObservable(SONGS);
      songSubscription = songObservable.subscribe({
        next: (songs: unknown) => {
          if (songs === null) {
            setSong(null);
          } else {
            const foundSong = (songs as Song[]).find(song => song.id === id);
            setSong(foundSong ? foundSong : null);
          }
        },
      });
    }

    setupHook();
    return () => {
      songSubscription.unsubscribe();
    };
  }, [id]);

  return song;
}
