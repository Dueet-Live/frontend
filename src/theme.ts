import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    me: Palette['primary'];
    friend: Palette['primary'];
  }
  interface PaletteOptions {
    me: PaletteOptions['primary'];
    friend: PaletteOptions['primary'];
  }
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#904AE9',
    },
    me: {
      main: '#904AE9',
    },
    friend: {
      main: '#e1a546',
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

export default responsiveFontSizes(theme);
