import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import songsAPI from '../api/songs';
import { RoomContext, RoomView } from '../contexts/RoomContext';
import { RoomInfo } from '../types/roomInfo';
import useSong from '../utils/useSong';
import GameView from './GameView';
import DefaultPiano from './Piano/DefaultPiano';
import SoloRoomHeader from './SoloRoomHeader';
import SoloSelectSong from './SoloSelectSong';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    flexGrow: 0,
  },
  body: {
    flexGrow: 1,
    flexShrink: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  piano: {
    bottom: 0,
    position: 'absolute',
  },
}));

const SoloRoom: React.FC = () => {
  const classes = useStyles();

  // TODO need to ensure that roomstate is reset after playing a song
  const [roomState, setRoomState] = useState({
    players: [],
    id: '',
  } as RoomInfo);
  const [chosenSongMIDI, setChosenSongMIDI] = useState<any>({});
  const [view, setView] = useState<RoomView>('solo.select');
  const [songSelectionGenre, setSongSelectionGenre] = useState('');

  const { piece } = roomState;
  const chosenSong = useSong(piece);

  useEffect(() => {
    if (piece === undefined) return;

    async function fetchSongMIDI() {
      if (piece === undefined) return;
      try {
        const song = await songsAPI.getSongWithContent(piece);
        setChosenSongMIDI(JSON.parse(song.content));
      } catch (err) {
        // TODO set a notification that it failed to retrieve song
        // from server
      }
    }

    fetchSongMIDI();
  }, [piece]);

  const mainBody = () => {
    const tracks = chosenSongMIDI.tracks;

    if (view === 'solo.select') {
      return (
        <SoloSelectSong
          genre={songSelectionGenre}
          setGenre={setSongSelectionGenre}
          isPieceDownloaded={!!tracks}
          handleStart={() => {
            setView('solo.play');
          }}
          tryPiano={() => setView('solo.try')}
          chosenSong={chosenSong}
        />
      );
    }

    if (view === 'solo.try') {
      return (
        <div className={classes.piano}>
          <DefaultPiano />
        </div>
      );
    }

    if (view === 'solo.play') {
      return <GameView chosenSongMIDI={chosenSongMIDI} />;
    }

    return <></>;
  };

  return (
    <RoomContext.Provider
      value={{
        roomInfo: roomState,
        setRoomInfo: setRoomState,
      }}
    >
      <Box className={classes.root}>
        {/* header */}
        <div className={classes.header}>
          <SoloRoomHeader
            view={view}
            setView={setView}
            selectedGenre={songSelectionGenre}
            setGenre={setSongSelectionGenre}
          />
        </div>
        {/* main body */}
        <div className={classes.body}>{mainBody()}</div>
      </Box>
    </RoomContext.Provider>
  );
};

export default SoloRoom;
