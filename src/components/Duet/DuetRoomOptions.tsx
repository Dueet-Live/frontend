import {
  Box,
  Button,
  ButtonBase,
  makeStyles,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { ReactComponent as RealisticPiano } from '../../svg/realistic-piano.svg';
import { ReactComponent as SmartPianoIcon } from '../../svg/smart-piano.svg';
import { Part } from '../../types/messages';
import { Song } from '../../types/song';
import { changeSpeed, choosePart } from '../../utils/socket';
import SpeedCustomization from '../shared/SpeedCustomization';
import SongSelectionDialog from '../SongSelectionDialog';
import PartPill from './PartPill';

const useStyles = makeStyles(theme => ({
  root: {
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    borderRadius: '3vh',
    borderWidth: '2px',
    height: '100%',
    width: '100%',
  },
  songCard: {
    display: 'flex',
  },
  imageContainer: {
    position: 'relative',
    width: 'calc(1vw * 20)',
    height: 'calc(1vw * 20)',
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
    borderRadius: 20,
  },
  pianoIcon: {
    height: '100%',
    width: '100%',
  },
  pianoIconSelected: {
    borderRadius: '10px',
    backgroundColor: '#C4C4C4',
  },
  selectPianoButtonBase: {
    display: 'flex',
    maxWidth: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  iAmReady: boolean;
  speed: number;
  song: Song | null;
  part: Part | null;
  useSmartPiano: boolean;
  setUseSmartPiano: (newValue: boolean) => void;
};

const DuetRoomOptions: React.FC<Props> = ({
  iAmReady,
  speed,
  song,
  part,
  useSmartPiano,
  setUseSmartPiano,
}) => {
  const classes = useStyles();

  const [songSelectionDialogOpen, setSongSelectionDialogOpen] = useState(false);

  const genreImage = `url(/images/${song?.genre.name || 'unknown'}.png)`;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      p={2}
      className={classes.root}
      justifyContent="space-around"
    >
      {/* song selection */}
      <SongSelectionDialog
        open={songSelectionDialogOpen}
        handleClose={() => setSongSelectionDialogOpen(false)}
      />
      <Box display="flex" justifyContent="space-between" flexGrow={1} mb={1}>
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
          textAlign="center"
        >
          <Typography variant="body1">
            {song?.name || 'No song selected'}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            disabled={iAmReady}
            onClick={() => setSongSelectionDialogOpen(true)}
          >
            <Typography variant="body2">
              {song?.name ? 'Pick another song' : 'Pick a song'}
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* part selection */}
      <Box display="flex" justifyContent="space-between" flexGrow={1}>
        <Box flex="0 0 30%" display="flex" alignItems="center">
          <Typography variant="body1">Your part</Typography>
        </Box>
        <Box
          display="flex"
          flexGrow={2}
          justifyContent="space-around"
          alignItems="center"
        >
          <PartPill
            part="primo"
            selected={part === 'primo'}
            onClick={() => choosePart('primo')}
          />
          <PartPill
            part="secondo"
            selected={part === 'secondo'}
            onClick={() => choosePart('secondo')}
          />
        </Box>
      </Box>

      {/* speed customisation */}
      <Box display="flex" justifyContent="space-between" flexGrow={1}>
        <Box flex="0 0 30%" display="flex" alignItems="center">
          <Typography variant="body1">Speed</Typography>
        </Box>
        <Box flexGrow={2} px={2} display="flex" alignItems="center">
          <SpeedCustomization speed={speed} setSpeed={changeSpeed} />
        </Box>
      </Box>

      {/* keyboard type */}
      <Box display="flex" justifyContent="space-between" flexGrow={1}>
        <Box flex="0 0 30%" display="flex" alignItems="center">
          <Typography variant="body1">Keyboard type</Typography>
        </Box>
        <Box display="flex" flexGrow={1} justifyContent="space-around">
          <ButtonBase
            className={classes.selectPianoButtonBase}
            onClick={() => setUseSmartPiano(true)}
            disabled={useSmartPiano}
          >
            <Box
              textAlign="center"
              p={1}
              className={useSmartPiano ? classes.pianoIconSelected : ''}
            >
              <SvgIcon
                component={SmartPianoIcon}
                viewBox="0 0 200 125"
                className={classes.pianoIcon}
              />
            </Box>
            <Typography variant="body1">Smart</Typography>
          </ButtonBase>
          <ButtonBase
            className={classes.selectPianoButtonBase}
            onClick={() => setUseSmartPiano(false)}
            disabled={!useSmartPiano}
          >
            <Box
              textAlign="center"
              p={1}
              className={!useSmartPiano ? classes.pianoIconSelected : ''}
            >
              <SvgIcon
                component={RealisticPiano}
                viewBox="0 0 200 125"
                className={classes.pianoIcon}
              />
            </Box>
            <Typography variant="body1">Realistic</Typography>
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
};
export default DuetRoomOptions;
