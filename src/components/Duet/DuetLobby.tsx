import { Box, makeStyles, useMediaQuery } from '@material-ui/core';
import React, { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext } from '../../contexts/RoomContext';
import { Song } from '../../types/song';
import { getParts, getReady } from '../../utils/roomInfo';
import DuetReadyButton from './DuetReadyButton';
import DuetRoomOptions from './DuetRoomOptions';
import PlayerCard from './PlayerCard';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(4),
    },
  },
}));

type Props = {
  chosenSong: Song | null;
  isPieceDownloaded: boolean;
  useSmartPiano: boolean;
  setUseSmartPiano: (newValue: boolean) => void;
};

const DuetLobby: React.FC<Props> = ({
  chosenSong,
  isPieceDownloaded,
  useSmartPiano,
  setUseSmartPiano,
}) => {
  const classes = useStyles();
  const { me: myPlayerId, friend: friendPlayerId } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const { me: iAmReady, friend: friendIsReady } = getReady(
    roomInfo,
    myPlayerId
  );
  const { speed } = roomInfo;
  const { me: myPart, friend: friendPart } = getParts(roomInfo, myPlayerId);

  const isDownloadingSong = chosenSong !== null && !isPieceDownloaded;

  const isPortrait = useMediaQuery('(orientation: portrait)');

  const playerCards = () => {
    return (
      <>
        <PlayerCard
          playerId={myPlayerId}
          myPlayerId={myPlayerId}
          isReady={iAmReady}
          part={myPart}
        />
        {friendPlayerId === null && (
          <PlayerCard playerId={null} myPlayerId={myPlayerId} />
        )}
        {friendPlayerId !== null && (
          <PlayerCard
            playerId={friendPlayerId}
            myPlayerId={myPlayerId}
            isReady={friendIsReady}
            part={friendPart}
          />
        )}
      </>
    );
  };

  const portraitView = () => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        justifyContent="space-around"
        className={classes.root}
      >
        {/* player cards */}
        <Box display="flex" justifyContent="space-evenly" flexGrow={1}>
          {playerCards()}
        </Box>

        {/* room configurations */}
        <Box flexGrow={3}>
          <DuetRoomOptions
            speed={speed}
            song={chosenSong}
            part={myPart}
            iAmReady={iAmReady}
            useSmartPiano={useSmartPiano}
            setUseSmartPiano={setUseSmartPiano}
          />
        </Box>

        {/* ready button */}
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <DuetReadyButton isDownloadingSong={isDownloadingSong} />
        </Box>
      </Box>
    );
  };

  const landscapeView = () => {
    return (
      <Box display="flex" flexGrow={1} className={classes.root}>
        {/* left half */}
        <Box
          display="flex"
          flexGrow={1}
          flexDirection="column"
          justifyContent="space-between"
        >
          {/* player cards */}
          <Box display="flex" justifyContent="space-evenly">
            {playerCards()}
          </Box>
          {/* ready button */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <DuetReadyButton isDownloadingSong={isDownloadingSong} />
          </Box>
        </Box>

        {/* right half */}
        <Box display="flex" flexGrow={1} maxWidth="50%">
          {/* room configurations */}
          <DuetRoomOptions
            speed={speed}
            song={chosenSong}
            part={myPart}
            iAmReady={iAmReady}
            useSmartPiano={useSmartPiano}
            setUseSmartPiano={setUseSmartPiano}
          />
        </Box>
      </Box>
    );
  };
  return isPortrait ? portraitView() : landscapeView();
};

export default DuetLobby;
