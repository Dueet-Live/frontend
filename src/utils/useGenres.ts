import { useEffect, useState } from 'react';
import { Genre } from '../types/Song';
import localforage, { GENRES } from './extendedLocalForage';

export default function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    let genreSubscription: Subscription;

    async function setupHook() {
      await localforage.ready();
      const genreObservable = localforage.getItemObservable(GENRES);
      genreSubscription = genreObservable.subscribe({
        next: (genres: unknown) => {
          if (genres === null) {
            setGenres([]);
          } else {
            setGenres(genres as Genre[]);
          }
        },
      });
    }

    setupHook();
    return () => {
      genreSubscription.unsubscribe();
    };
  }, []);

  return genres;
}
