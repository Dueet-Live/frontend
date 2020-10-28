import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import songsAPI from '../../api/songs';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import { MidiJSON } from '../../types/MidiJSON';
import { RoomInfo } from '../../types/roomInfo';
import { startAudioContext } from '../../utils/toneContext';
import useSong from '../../utils/useSong';
import GameView from '../Game/GameView';
import { Score } from '../Game/types';
import DefaultPiano from '../Piano/DefaultPiano';
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
  const [chosenSongMIDI, setChosenSongMIDI] = useState<MidiJSON | undefined>();
  const [view, setView] = useState<RoomView>('solo.select');
  const [songSelectionGenre, setSongSelectionGenre] = useState('');
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });

  const { piece } = roomState;
  const chosenSong = useSong(piece);

  useEffect(() => {
    if (piece === undefined) return;

    async function fetchSongMIDI() {
      if (piece === undefined) return;
      try {
        const song = await songsAPI.getSongWithContent(piece);
        setChosenSongMIDI(JSON.parse(song.content) as MidiJSON);
      } catch (err) {
        // TODO set a notification that it failed to retrieve song
        // from server
      }
    }

    fetchSongMIDI();
  }, [piece]);

  const mainBody = () => {
    if (view === 'solo.select') {
      return (
        <SoloSelectSong
          genre={songSelectionGenre}
          setGenre={setSongSelectionGenre}
          isPieceDownloaded={!!chosenSongMIDI}
          handleStart={() => {
            setView('solo.play');
            startAudioContext(); // AudioContext has to be started with a click event
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

    if (view === 'solo.play' && !!chosenSongMIDI) {
      return <GameView chosenSongMIDI={chosenSongMIDI} setScore={setScore} />;
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
            score={score}
            view={view}
            setView={setView}
            selectedGenre={songSelectionGenre}
            setGenre={setSongSelectionGenre}
            resetScore={() => setScore({ correct: 0, total: 0 })}
          />
        </div>
        {/* main body */}
        <div className={classes.body}>{mainBody()}</div>
      </Box>
    </RoomContext.Provider>
  );
};

export default SoloRoom;
