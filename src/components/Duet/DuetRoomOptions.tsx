import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Part } from '../../types/messages';
import { Song } from '../../types/song';
import { changeSpeed, choosePart, choosePiece } from '../../utils/socket';
import LobbyKeyboardTypeSelector from '../shared/LobbyKeyboardTypeSelector';
import useSharedLobbyStyles from '../shared/LobbySharedStyles';
import LobbySongSelection from '../shared/LobbySongSelection';
import SpeedCustomization from '../shared/SpeedCustomization';
import SongSelectionDialog from '../SongSelectionDialog';
import PartPill from './PartPill';

const useStyles = makeStyles(theme => ({
  root: {
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    borderRadius: '3vh',
    borderWidth: '2px',
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
  const lobbySharedStyles = useSharedLobbyStyles();

  const [songSelectionDialogOpen, setSongSelectionDialogOpen] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      p={2}
      className={classes.root}
      justifyContent="space-between"
    >
      {/* song selection */}
      <SongSelectionDialog
        open={songSelectionDialogOpen}
        handleClose={() => setSongSelectionDialogOpen(false)}
        type="duet"
        onChooseSong={(song: Song) => {
          // send socket request
          choosePiece(song.id);
        }}
      />
      <LobbySongSelection
        iAmReady={iAmReady}
        setSongSelectionDialogOpen={setSongSelectionDialogOpen}
        song={song}
        flexGrow={1}
        mb={1}
      />

      {/* part selection */}
      <Box display="flex" justifyContent="space-between" flexGrow={1}>
        <Box flex="0 0 30%" display="flex" alignItems="center">
          <Typography variant="body1" className={lobbySharedStyles.optionLabel}>
            Your part
          </Typography>
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
      <SpeedCustomization speed={speed} setSpeed={changeSpeed} flexGrow={1} />

      {/* keyboard type */}
      <LobbyKeyboardTypeSelector
        useSmartPiano={useSmartPiano}
        setUseSmartPiano={setUseSmartPiano}
        flexGrow={1}
      />
    </Box>
  );
};
export default DuetRoomOptions;
