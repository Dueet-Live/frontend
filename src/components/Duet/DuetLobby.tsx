import { Box, useMediaQuery } from '@material-ui/core';
import React, { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext } from '../../contexts/RoomContext';
import { Song } from '../../types/song';
import { getParts, getReady } from '../../utils/roomInfo';
import DuetReadyButton from './DuetReadyButton';
import DuetRoomOptions from './DuetRoomOptions';
import PlayerCard from './PlayerCard';

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
  const { me: myPlayerId, friend: friendPlayerId } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const { me: iAmReady, friend: friendIsReady } = getReady(
    roomInfo,
    myPlayerId
  );
  const { speed } = roomInfo;
  const { me: myPart, friend: friendPart } = getParts(roomInfo, myPlayerId);

  const isDownloadingSong = chosenSong !== null && !isPieceDownloaded;

  // TODO
  const isPortrait = useMediaQuery('(orientation: portrait)');

  const portraitView = () => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="space-around"
        m={2}
      >
        {/* player cards */}
        <Box display="flex" justifyContent="space-evenly" flexGrow={1}>
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

  return isPortrait ? portraitView() : portraitView();
};

export default DuetLobby;
