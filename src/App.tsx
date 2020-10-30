import { CssBaseline, ThemeProvider } from '@material-ui/core';
import localforage from 'localforage';
import React, { useEffect } from 'react';
import genresAPI from './api/genres';
import songsAPI from './api/songs';
import AppRouter from './components/AppRouter';
import NotificationShell from './components/NotificationShell';
import theme from './theme';
import { GENRES, SONGS } from './utils/extendedLocalForage';

const App: React.FC = () => {
  // retrieve songs and genres from API on startup
  useEffect(() => {
    async function fetch() {
      try {
        const genres = await genresAPI.getGenres();
        const songs = await songsAPI.getSongs();

        await localforage.setItem(GENRES, genres);
        await localforage.setItem(SONGS, songs);
      } catch (err) {
        // TODO handle error
        console.log(err);
      }
    }
    fetch();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationShell>
        <AppRouter />
      </NotificationShell>
    </ThemeProvider>
  );
};

export default App;
