import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import songsAPI from '../../api/songs';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import { MidiJSON } from '../../types/MidiJSON';
import { RoomInfo } from '../../types/roomInfo';
import { getFriendId, getMyPart } from '../../utils/roomInfo';
import socket, {
  addListeners,
  createRoom,
  joinRoom,
  removeRoomStateListeners,
} from '../../utils/socket';
import useSong from '../../utils/useSong';
import { FlyingNotesHandle } from '../Game/FlyingNotes';
import GameView from '../Game/GameView';
import { Score } from '../Game/types';
import FreePlayPiano from '../Piano/TraditionalPiano/FreePlayPiano';
import DuetLobby from './DuetLobby';
import DuetRoomHeader from './DuetRoomHeader';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  body: {
    flexGrow: 1,
    flexShrink: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexGrow: 0,
  },
  piano: {
    bottom: 0,
    position: 'absolute',
  },
}));

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const classes = useStyles();
  const history = useHistory();

  // TODO need to ensure that roomstate is reset after playing a song
  const [roomState, setRoomState] = useState({
    players: [],
    id: '',
  } as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);

  const [chosenSongMIDI, setChosenSongMIDI] = useState<MidiJSON | undefined>();
  const [view, setView] = useState<RoomView>('duet.lobby');
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });

  const { piece } = roomState;
  const chosenSong = useSong(piece);

  useEffect(() => {
    // connect to ws server
    socket.open();

    addListeners(setPlayerId, setRoomState, setView, history);
    return () => {
      removeRoomStateListeners();
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (maybeRoomId === null) {
      createRoom();
      setPlayerId(-1);
    } else if (!isCreate) {
      joinRoom(maybeRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maybeRoomId]);

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

  const friendId = getFriendId(roomState, playerId);
  const myPart = getMyPart(roomState, playerId);

  const myFlyingNotesHandleRef = useRef<FlyingNotesHandle | null>(null);
  const friendFlyingNotesHandleRef = useRef<FlyingNotesHandle | null>(null);

  const handleNotePlay = (note: number, playedBy: number) => {
    if (playedBy === playerId) {
      myFlyingNotesHandleRef.current?.addNote();
    } else {
      friendFlyingNotesHandleRef.current?.addNote();
    }
  };

  const mainBody = () => {
    if (view === 'duet.lobby') {
      return (
        <DuetLobby
          isPieceDownloaded={!!chosenSongMIDI}
          chosenSong={chosenSong}
          tryPiano={() => setView('duet.try')}
        />
      );
    }

    if (view === 'duet.try') {
      return (
        <div className={classes.piano}>
          <FreePlayPiano handleNotePlay={handleNotePlay} />
        </div>
      );
    }

    if (view === 'duet.play' && !!chosenSongMIDI) {
      // at this point, myPart is definitely either primo or secondo, otherwise
      // game should not have started.

      return (
        <GameView
          chosenSongMIDI={chosenSongMIDI}
          setScore={setScore}
          myPart={myPart}
          handleNotePlay={handleNotePlay}
        />
      );
    }
  };

  return (
    <RoomContext.Provider
      value={{
        roomInfo: roomState,
        setRoomInfo: setRoomState,
      }}
    >
      <PlayerContext.Provider
        value={{
          me: playerId,
          friend: friendId,
        }}
      >
        <Box className={classes.root}>
          {/* header */}
          <div className={classes.header}>
            <DuetRoomHeader
              view={view}
              setView={setView}
              score={score}
              resetScore={() => setScore({ correct: 0, total: 0 })}
              myFlyingNotesHandleRef={myFlyingNotesHandleRef}
              friendFlyingNotesHandleRef={friendFlyingNotesHandleRef}
            />
          </div>

          <div className={classes.body}>{mainBody()}</div>
        </Box>
      </PlayerContext.Provider>
    </RoomContext.Provider>
  );
};

export default DuetRoom;
