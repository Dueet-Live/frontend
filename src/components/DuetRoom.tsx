import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { RoomInfo } from '../types/RoomInfo';
import { PlayerInfo } from '../types/PlayerInfo';
import socket, { addListeners, createRoom, joinRoom } from '../utils/socket';
import useWindowDimensions from '../utils/useWindowDimensions';
import {
  calculateKeyboardRange,
  calculateKeyWidth,
  calculateStartNote,
} from '../utils/calculateKeyboardDimension';
import InteractivePiano from './InteractivePiano';
import { playNote, stopNote } from '../utils/socket';
import { PlayerContext } from './PlayerContext';

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
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

  // TODO refactor socket io listeners to a separate file
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
      <h3>Duet</h3>
      <h4>Code: {roomState.id}</h4>
      <h4>Players: {roomState.players.length} </h4>

      <Link to="/">
        <button>Back</button>
      </Link>

      <div>
        <PlayerContext.Provider
          value={{
            me: playerId,
            friend: getFriendId(roomState.players, playerId),
          }}
        >
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
        </PlayerContext.Provider>
      </div>
    </>
  );
};

export default DuetRoom;
