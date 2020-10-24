import { useEffect, useState } from 'react';
import { Song } from '../types/Song';
import localforage, { SONGS } from './extendedLocalForage';

export default function useSongs(type: 'solo' | 'duet') {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    let songSubscription: Subscription;

    async function setupHook() {
      await localforage.ready();
      const songObservable = localforage.getItemObservable(SONGS);
      songSubscription = songObservable.subscribe({
        next: (songs: unknown) => {
          if (songs === null) {
            setSongs([]);
          } else {
            setSongs((songs as Song[]).filter(song => song.type === type));
          }
        },
      });
    }

    setupHook();
    return () => {
      songSubscription.unsubscribe();
    };
  }, [type]);

  return songs;
}
