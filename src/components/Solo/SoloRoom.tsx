import { Box, makeStyles } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import songsAPI from '../../api/songs';
import { NotificationContext } from '../../contexts/NotificationContext';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import { MidiJSON } from '../../types/MidiJSON';
import { RoomInfo } from '../../types/roomInfo';
import { startAudioContext } from '../../utils/toneContext';
import useSong from '../../utils/useSong';
import GameView from '../Game/GameView';
import { Score } from '../Game/types';
import FreePlayPiano from '../Piano/TraditionalPiano/FreePlayPiano';
import SoloRoomHeader from './SoloRoomHeader';
import SoloSelectSong from './SoloSelectSong';
import * as Tone from 'tone';

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
    speed: 1,
  } as RoomInfo);
  const [chosenSongMIDI, setChosenSongMIDI] = useState<MidiJSON | undefined>();
  const [view, setView] = useState<RoomView>('solo.select');
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [gameStartTime, setGameStartTime] = useState(-1);
  const displayNotification = useContext(NotificationContext);
  const [useSmartPiano, setUseSmartPiano] = useState(true);

  const { piece, speed } = roomState;
  const chosenSong = useSong(piece);

  useEffect(() => {
    if (piece === undefined) return;

    async function fetchSongMIDI() {
      if (piece === undefined) return;
      try {
        const song = await songsAPI.getSongWithContent(piece);
        setChosenSongMIDI(JSON.parse(song.content) as MidiJSON);
      } catch (err) {
        displayNotification({
          message: 'Failed to connect to Song server, please try again later',
          severity: 'error',
        });
      }
    }

    fetchSongMIDI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  const mainBody = () => {
    if (view === 'solo.select') {
      return (
        <SoloSelectSong
          isPieceDownloaded={!!chosenSongMIDI}
          handleStart={() => {
            startAudioContext(); // AudioContext has to be started with a click event
            setGameStartTime(Tone.now() + 3);
            setView('solo.play');
          }}
          tryPiano={() => setView('solo.try')}
          chosenSong={chosenSong}
          speed={speed}
          setSpeed={(speed: number) =>
            setRoomState((prevState: RoomInfo) => ({ ...prevState, speed }))
          }
          useSmartPiano={useSmartPiano}
          setUseSmartPiano={setUseSmartPiano}
        />
      );
    }

    if (view === 'solo.try') {
      return (
        <div className={classes.piano}>
          <FreePlayPiano />
        </div>
      );
    }

    if (view.includes('solo.play') && !!chosenSongMIDI) {
      return (
        <GameView
          speed={speed}
          setView={setView}
          chosenSongMIDI={chosenSongMIDI}
          setScore={setScore}
          showSmartPiano={useSmartPiano}
          gameStartTime={gameStartTime}
        />
      );
    }

    return <></>;
  };

  return (
    <RoomContext.Provider
      value={{
        roomInfo: roomState,
        score: score,
        view: view,
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
