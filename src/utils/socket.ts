import { History } from 'history';
import io from 'socket.io-client';
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

const socket = io(process.env.REACT_APP_WS_URL!, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

export function addListeners(
  setPlayerId: (id: number) => void,
  setRoomState: (roomInfo: RoomInfo) => void,
  history: History<unknown>
) {
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
}

export function createRoom() {
  socket.emit(CREATE_ROOM_REQUEST, {});
}

export function joinRoom(id: string) {
  socket.emit(JOIN_ROOM_REQUEST, { roomId: id });
}

export default socket;
