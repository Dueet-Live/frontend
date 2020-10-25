import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import songsAPI from '../../api/songs';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomView, RoomContext } from '../../contexts/RoomContext';
import { MidiJSON } from '../../types/MidiJSON';
import { RoomInfo } from '../../types/roomInfo';
import { getFriendId, getMyPart } from '../../utils/roomInfo';
import socket, {
  addListeners,
  removeRoomStateListeners,
  createRoom,
  joinRoom,
} from '../../utils/socket';
import useSong from '../../utils/useSong';
import GameView from '../Game/GameView';
import DefaultPiano from '../Piano/DefaultPiano';
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
          <DefaultPiano />
        </div>
      );
    }

    if (view === 'duet.play' && !!chosenSongMIDI) {
      // at this point, myPart is definitely either primo or secondo, otherwise
      // game should not have started.
      // TODO account for part in duet

      return <GameView chosenSongMIDI={chosenSongMIDI} myPart={myPart} />;
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
            <DuetRoomHeader view={view} setView={setView} />
          </div>

          <div className={classes.body}>{mainBody()}</div>
        </Box>
      </PlayerContext.Provider>
    </RoomContext.Provider>
  );
};

export default DuetRoom;