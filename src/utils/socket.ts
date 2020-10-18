import { History } from 'history';
import io from 'socket.io-client';
import {
  CHOOSE_PART_REQUEST,
  CHOOSE_PIECE_REQUEST,
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  JoinRoomFailureResponse,
  JoinRoomResponse,
  JoinRoomSuccessResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  NotePlayedMessage,
  NOTE_PLAYED,
  Part,
  READY_REQUEST,
  RoomCreatedResponse,
  ROOM_INFO_UPDATED_NOTIFICATION,
  START_GAME_NOTIFICATION,
  UnknownErrorResponse,
  UNKNOWN_MESSAGE_RESPONSE,
} from '../types/messages';
import { RoomInfo } from '../types/roomInfo';

const socket = io(process.env.REACT_APP_WS_URL!, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

export function addListeners(
  setPlayerId: (id: number) => void,
  setRoomState: (roomInfo: RoomInfo) => void,
  setTimeToStart: (inSeconds: number) => void,
  history: History<unknown>
) {
  /*************** Create room ***************/
  socket.on(
    CREATE_ROOM_RESPONSE,
    ({ roomInfo, playerId }: RoomCreatedResponse) => {
      setRoomState(roomInfo);
      setPlayerId(playerId);
      history.push(`/duet?id=${roomInfo.id}`);
    }
  );

  /****************** Miscellaneous *****************/
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

  /********************* Join room ****************/
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

  /****************** Room info updated **********************/
  socket.on(ROOM_INFO_UPDATED_NOTIFICATION, (roomInfo: RoomInfo) => {
    setRoomState(roomInfo);
  });

  socket.on(START_GAME_NOTIFICATION, ({ inSeconds }: { inSeconds: number }) => {
    setTimeToStart(inSeconds);
  });
}

export function addNotePlayListener(
  handleNotePlayByFriend: (note: number) => void,
  handleNoteStopByFriend: (note: number) => void
) {
  socket.on(NOTE_PLAYED, ({ note, event }: NotePlayedMessage) => {
    console.log(`Received ${event} event for note ${note}`);
    if (event === 'keydown') {
      handleNotePlayByFriend(note);
    }
    if (event === 'keyup') {
      handleNoteStopByFriend(note);
    }
  });
}

export function removeNotePlayListener() {
  socket.removeEventListener(NOTE_PLAYED);
}

export function createRoom() {
  socket.emit(CREATE_ROOM_REQUEST, {});
}

export function joinRoom(id: string) {
  socket.emit(JOIN_ROOM_REQUEST, { roomId: id });
}

export function playNote(note: number) {
  // console.log(`Send ${note} start`)
  socket.emit(NOTE_PLAYED, { note, event: 'keydown' });
}

export function stopNote(note: number) {
  // console.log(`Send ${note} stop`)
  socket.emit(NOTE_PLAYED, { note, event: 'keyup' });
}

export const choosePart = (id: Part) => {
  socket.emit(CHOOSE_PART_REQUEST, { id });
};

export function choosePiece(id: number) {
  socket.emit(CHOOSE_PIECE_REQUEST, { id });
}

export function updateReady(isReady: boolean) {
  socket.emit(READY_REQUEST, { ready: isReady });
}

export default socket;
