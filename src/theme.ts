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
  breakpoints: {
    values: {
      xs: 0,
      sm: 400,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#904AE9',
    },
    secondary: {
      main: '#7B66FC',
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

// `responsizeFontSize` only makes headers responsive
// Make body font size smaller for small screens
theme.typography.body1 = {
  fontSize: '0.8rem',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
  },
};

theme.typography.body2 = {
  fontSize: '0.7rem',
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
  },
};

export default responsiveFontSizes(theme);
