import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import React from 'react';
import AppRouter from './components/AppRouter';
import NotificationShell from './components/NotificationShell';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#904AE9',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          height: 'calc(var(--vh, 1vh) * 100)',
        },
      },
    },
  },
});

const App: React.FC = () => {
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
