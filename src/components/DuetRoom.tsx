import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  JoinRoomResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  RoomCreatedResponse,
  UnknownErrorResponse,
  UNKNOWN_MESSAGE_RESPONSE,
} from '../types/Messages';
import socket from '../utils/socket';

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const history = useHistory();

  // TODO refactor socket io listeners to a separate file
  useEffect(() => {
    // connect to ws server
    socket.open();

    socket.on(
      CREATE_ROOM_RESPONSE,
      ({ roomId, playerId }: RoomCreatedResponse) => {
        // TODO fill room state
        history.push(`/duet?id=${roomId}`);
      }
    );

    socket.on(
      MALFORMED_MESSAGE_RESPONSE,
      ({ message }: MalformedMessageResponse) => {
        // TODO snackbar
        console.log(message);
      }
    );
    socket.on(UNKNOWN_MESSAGE_RESPONSE, ({ error }: UnknownErrorResponse) => {
      // TODO snackbar
      console.log(error);
    });

    socket.on(JOIN_ROOM_RESPONSE, ({ success }: JoinRoomResponse) => {
      if (!success) {
        // failed to join room, so create a room instead
        // TODO snackbar
        history.push('/duet');
        return;
      }

      // TODO fill room state
    });
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

  return (
    <>
      <h3>Duet</h3>

      <Link to="/">
        <button>Back</button>
      </Link>
    </>
  );
};

export default DuetRoom;
