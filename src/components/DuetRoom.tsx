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
        history.push(`/duet?id=${roomInfo.id}`);
        setRoomState(roomInfo);
        setPlayerId(playerId);
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

    socket.on(JOIN_ROOM_RESPONSE, (res: JoinRoomResponse) => {
      if (!res.success) {
        // failed to join room, so create a room instead
        // TODO snackbar
        const { code, message } = res as JoinRoomFailureResponse;
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

  // TODO isLoading until playerId and roomInfo are set

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
