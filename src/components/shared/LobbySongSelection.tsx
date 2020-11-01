import {
  Box,
  BoxProps,
  Button,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { Song } from '../../types/song';

const useStyles = makeStyles(theme => ({
  songName: {
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h4.fontSize,
    },
  },
  pickSongButtonText: {
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h5.fontSize,
    },
  },
  imageContainer: {
    position: 'relative',
    width: 'calc(1vh * 20)',
    height: 'calc(1vh * 20)',
    '@media (orientation: portrait)': {
      width: 'calc(1vw * 20)',
      height: 'calc(1vw * 20)',
    },
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
    borderRadius: 15,
  },
}));

type Props = BoxProps & {
  iAmReady: boolean;
  setSongSelectionDialogOpen: (newValue: boolean) => void;
  song: Song | null;
};

const LobbySongSelection: React.FC<Props> = ({
  iAmReady,
  setSongSelectionDialogOpen,
  song,
  ...boxProps
}) => {
  const classes = useStyles();
  const genreImage = `url(/images/${song?.genre.name || 'unknown'}.png)`;
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      {...boxProps}
    >
      <Box className={classes.imageContainer} flex="0 0 auto" mr={1}>
        <Box
          className={classes.imageSrc}
          style={{ backgroundImage: genreImage }}
        ></Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-evenly"
        flexGrow={1}
        alignSelf="stretch"
        textAlign="center"
      >
        <Typography variant="body1" className={classes.songName}>
          {song?.name || 'No song selected'}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          disabled={iAmReady}
          onClick={() => setSongSelectionDialogOpen(true)}
        >
          <Typography variant="body2" className={classes.pickSongButtonText}>
            {song?.name ? 'Pick another song' : 'Pick a song'}
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default LobbySongSelection;
