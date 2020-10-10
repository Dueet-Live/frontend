import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { RoomInfo } from '../types/RoomInfo';
import socket, { addListeners, createRoom, joinRoom } from '../utils/socket';

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const history = useHistory();
  const [roomState, setRoomState] = useState({} as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);

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
    </>
  );
};

export default DuetRoom;
