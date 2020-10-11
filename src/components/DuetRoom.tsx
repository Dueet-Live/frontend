import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { PlayerInfo } from '../types/PlayerInfo';
import { RoomInfo } from '../types/RoomInfo';
import {
  calculateKeyboardRange,
  calculateKeyWidth,
  calculateStartNote,
} from '../utils/calculateKeyboardDimension';
import socket, {
  addListeners,
  createRoom,
  joinRoom,
  playNote,
  stopNote,
} from '../utils/socket';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { PlayerContext } from './PlayerContext';
import RoomHeader from './RoomHeader';

const useStyles = makeStyles(theme => ({
  piano: {
    position: 'absolute',
    bottom: 0,
  },
}));

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [roomState, setRoomState] = useState({} as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);

  const { width } = useWindowDimensions();
  const keyWidth = calculateKeyWidth(width);
  const range = calculateKeyboardRange(width);
  const getFriendId = (players: PlayerInfo[], myId: number) => {
    if (!players) {
      return null;
    }
    const friendInfo = players.filter(player => player.id !== myId);
    if (friendInfo.length === 0) {
      return null;
    } else {
      return friendInfo[0].id;
    }
  };

  useEffect(() => {
    // connect to ws server
    socket.open();

    addListeners(setPlayerId, setRoomState, history);

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (maybeRoomId === null) {
      createRoom();
    } else if (!isCreate) {
      joinRoom(maybeRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maybeRoomId]);

  // TODO rather than these, we can probably straight up load the piano and
  // the rest of the elements on the screen, but modify the room status part
  // of the screen accordingly instead.
  if (maybeRoomId === null) {
    return (
      <>
        <h3>Creating room...</h3>
        <Link to="/">
          <button>Back</button>
        </Link>
      </>
    );
  }

  // trying to join room
  if (playerId === -1) {
    return (
      <>
        <h3>Joining room...</h3>
        <Link to="/">
          <button>Back</button>
        </Link>
      </>
    );
  }

  return (
    <>
      <PlayerContext.Provider
        value={{
          me: playerId,
          friend: getFriendId(roomState.players, playerId),
        }}
      >
        <RoomHeader />
        <div className={classes.piano}>
          <InteractivePiano
            start={calculateStartNote(range)}
            range={range}
            keyWidth={keyWidth}
            didPlayNote={(note, playedBy) => {
              if (playerId === playedBy) {
                playNote(note);
              }
            }}
            didStopNote={(note, playedBy) => {
              if (playerId === playedBy) {
                stopNote(note);
              }
            }}
          />
        </div>
      </PlayerContext.Provider>
    </>
  );
};

export default DuetRoom;
