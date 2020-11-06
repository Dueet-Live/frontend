import { Box, Typography, useMediaQuery } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { RoomContext } from '../../contexts/RoomContext';
import { RoomInfo } from '../../types/roomInfo';
import { Song } from '../../types/song';
import { sendGAEvent } from '../GoogleAnalytics';
import LobbyKeyboardTypeSelector from '../shared/LobbyKeyboardTypeSelector';
import useSharedLobbyStyles from '../shared/LobbySharedStyles';
import LobbySongSelection from '../shared/LobbySongSelection';
import SpeedCustomization from '../shared/SpeedCustomization';
import SongSelectionDialog from '../SongSelectionDialog';
import SoloReadyButton from './SoloReadyButton';

type Props = {
  chosenSong: Song | null;
  isPieceDownloaded: boolean;
  handleStart: () => void;
  tryPiano: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  useSmartPiano: boolean;
  setUseSmartPiano: (newValue: boolean) => void;
};

const SoloSelectSong: React.FC<Props> = ({
  chosenSong,
  isPieceDownloaded,
  handleStart,
  speed,
  setSpeed,
  useSmartPiano,
  setUseSmartPiano,
}) => {
  const lobbySharedStyles = useSharedLobbyStyles();

  const { setRoomInfo } = useContext(RoomContext);

  const [songSelectionDialogOpen, setSongSelectionDialogOpen] = useState(false);

  const downloadingSong = chosenSong !== null && !isPieceDownloaded;

  const isPortrait = useMediaQuery('(orientation: portrait)');

  const songSelection = () => {
    return (
      <>
        <SongSelectionDialog
          open={songSelectionDialogOpen}
          handleClose={() => setSongSelectionDialogOpen(false)}
          type="solo"
          onChooseSong={(song: Song) => {
            setRoomInfo((prevState: RoomInfo) => ({
              ...prevState,
              piece: song.id,
            }));
          }}
        />
        <Box>
          <Typography variant="h6">Song Selection</Typography>
        </Box>
        <Box
          flexGrow={3}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          className={lobbySharedStyles.roundedBorder}
          p={2}
        >
          <LobbySongSelection
            song={chosenSong}
            disabled={false}
            setSongSelectionDialogOpen={setSongSelectionDialogOpen}
            flexGrow={1}
          />
        </Box>
      </>
    );
  };

  const otherOptions = () => {
    return (
      <>
        <Box>
          <Typography variant="h6">Other Options</Typography>
        </Box>
        <Box
          flexGrow={3}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          className={lobbySharedStyles.roundedBorder}
          p={2}
        >
          <SpeedCustomization speed={speed} setSpeed={setSpeed} flexGrow={1} />
          <LobbyKeyboardTypeSelector
            useSmartPiano={useSmartPiano}
            setUseSmartPiano={setUseSmartPiano}
            flexGrow={1}
          />
        </Box>
      </>
    );
  };

  const readyButton = () => {
    return (
      <SoloReadyButton
        disabled={chosenSong === null || downloadingSong}
        handleStart={() => {
          sendGAEvent({
            category: 'Solo',
            action: 'Play',
            label: chosenSong?.name,
          });
          handleStart();
        }}
      >
        {downloadingSong ? 'Loading' : 'Play'}
      </SoloReadyButton>
    );
  };

  const landscapeView = () => {
    return (
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        p={2}
      >
        <Box flexGrow={3} display="flex" justifyContent="space-between">
          {/* left side */}
          <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            maxWidth="50%"
            mr={1}
          >
            {songSelection()}
          </Box>
          {/* right side */}
          <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            maxWidth="50%"
            ml={1}
          >
            {otherOptions()}
          </Box>
        </Box>
        {/* play button */}
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
          alignItems="center"
          mt={1}
        >
          {readyButton()}
        </Box>
      </Box>
    );
  };

  const portraitView = () => {
    return (
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        p={2}
      >
        {/* song selection */}
        <Box flexGrow={2} display="flex" flexDirection="column" mb={2}>
          {songSelection()}
        </Box>
        {/* other options */}
        <Box flexGrow={2} display="flex" flexDirection="column" mb={2}>
          {otherOptions()}
        </Box>
        {/* play button */}
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
          alignItems="center"
        >
          {readyButton()}
        </Box>
      </Box>
    );
  };

  return isPortrait ? portraitView() : landscapeView();
};

export default SoloSelectSong;
