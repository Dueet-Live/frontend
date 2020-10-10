import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  JoinRoomFailureResponse,
  JoinRoomResponse,
  JoinRoomSuccessResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  RoomCreatedResponse,
  ROOM_INFO_UPDATED_NOTIFICATION,
  UnknownErrorResponse,
  UNKNOWN_MESSAGE_RESPONSE,
} from '../types/Messages';
import { RoomInfo } from '../types/RoomInfo';
import socket from '../utils/socket';

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

    socket.on(
      CREATE_ROOM_RESPONSE,
      ({ roomInfo, playerId }: RoomCreatedResponse) => {
        setRoomState(roomInfo);
        setPlayerId(playerId);
        history.push(`/duet?id=${roomInfo.id}`);
      }
    );

    socket.on(
      MALFORMED_MESSAGE_RESPONSE,
      ({ message }: MalformedMessageResponse) => {
        // TODO decide what to do depending on error. For now we just throw them
        // to create
        // TODO snackbar
        console.log(message + '... creating new room');
        history.push('/duet');
      }
    );
    socket.on(UNKNOWN_MESSAGE_RESPONSE, ({ error }: UnknownErrorResponse) => {
      // TODO decide what to do depending on error. For now we just throw them
      // to create
      // TODO snackbar
      console.log(error + '... creating new room');
      history.push('/duet');
    });

    socket.on(JOIN_ROOM_RESPONSE, (res: JoinRoomResponse) => {
      if (!res.success) {
        // failed to join room, so create a room instead
        // TODO snackbar
        const { code, message } = res as JoinRoomFailureResponse;
        console.log(code + ': ' + message + '... creating new room');
        history.push('/duet');
        return;
      }

      const { roomInfo, playerId } = res as JoinRoomSuccessResponse;
      setRoomState(roomInfo);
      setPlayerId(playerId);
    });

    socket.on(ROOM_INFO_UPDATED_NOTIFICATION, (roomInfo: RoomInfo) => {
      setRoomState(roomInfo);
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (maybeRoomId === null) {
      socket.emit(CREATE_ROOM_REQUEST, {});
    } else if (!isCreate) {
      socket.emit(JOIN_ROOM_REQUEST, { roomId: maybeRoomId });
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
