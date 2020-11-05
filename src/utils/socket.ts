import { History } from 'history';
import io from 'socket.io-client';
import { RoomView } from '../contexts/RoomContext';
import {
  CHANGE_SPEED_REQUEST,
  CHOOSE_PART_REQUEST,
  CHOOSE_PIECE_REQUEST,
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
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
import { Notification } from '../types/Notification';
import { RoomInfo } from '../types/roomInfo';
import * as Tone from 'tone';

const socket = io(process.env.REACT_APP_WS_URL!, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

export function addListeners(
  setPlayerId: (id: number) => void,
  setRoomState: (roomInfo: React.SetStateAction<RoomInfo>) => void,
  setView: (view: RoomView) => void,
  setGameStartTime: (startTime: number) => void,
  displayNotification: (notification: Notification) => void,
  history: History<unknown>
) {
  // not assigned yet
  let myPlayerId: number = -1;
  /*************** Create room ***************/
  socket.on(
    CREATE_ROOM_RESPONSE,
    ({ roomInfo, playerId }: RoomCreatedResponse) => {
      setRoomState(roomInfo);
      myPlayerId = playerId;
      setPlayerId(playerId);
      history.push(`/duet/play?id=${roomInfo.id}`);
    }
  );

  /****************** Miscellaneous *****************/
  socket.on(
    MALFORMED_MESSAGE_RESPONSE,
    ({ message }: MalformedMessageResponse) => {
      // this is only for validation errors, which should never occur unless
      // the user is messing around with our internals
      displayNotification({
        message: 'An error has been encountered, please reload the app',
        severity: 'error',
      });
      history.push('/duet');
    }
  );
  socket.on(UNKNOWN_MESSAGE_RESPONSE, ({ error }: UnknownErrorResponse) => {
    displayNotification({
      message: 'An error has been encountered, please reload the app',
      severity: 'error',
    });
    history.push('/duet');
  });

  /********************* Join room ****************/
  socket.on(JOIN_ROOM_RESPONSE, (res: JoinRoomResponse) => {
    if (!res.success) {
      if (res.code === 100) {
        displayNotification({
          message: "We couldn't find this room. Do you have the right code?",
          severity: 'error',
        });
      } else if (res.code === 101) {
        displayNotification({
          message: 'This room is already full',
          severity: 'error',
        });
      }
      // failed to join room, redirect back to duet page
      history.push('/duet');
      return;
    }

    const { roomInfo, playerId } = res as JoinRoomSuccessResponse;
    setRoomState(roomInfo);
    myPlayerId = playerId;
    setPlayerId(playerId);
  });

  /****************** Room info updated **********************/
  socket.on(ROOM_INFO_UPDATED_NOTIFICATION, (roomInfo: RoomInfo) => {
    let message: Notification | null = null;
    setRoomState((prevRoomInfo: RoomInfo) => {
      if (prevRoomInfo.players.length === 0) {
        return roomInfo;
      }

      const prevFriend = prevRoomInfo.players.find(
        player => player.id !== myPlayerId
      );

      const curFriend = roomInfo.players.find(
        player => player.id !== myPlayerId
      );

      if (!prevFriend && !!curFriend) {
        message = {
          message: 'Your partner has joined the room',
          severity: 'info',
        };
      } else if (!!prevFriend && !curFriend) {
        message = {
          message: 'Your partner has left the room',
          severity: 'info',
        };
      } else if (
        !!prevFriend &&
        !!curFriend &&
        prevFriend.ready &&
        !curFriend.ready
      ) {
        message = {
          message: 'Your partner is not ready anymore',
          severity: 'info',
        };
      } else if (
        !!prevFriend &&
        !!curFriend &&
        !prevFriend.ready &&
        curFriend.ready
      ) {
        message = {
          message: 'Your partner is ready now',
          severity: 'info',
        };
      } else {
        message = null;
      }

      return roomInfo;
    });
    if (message !== null) {
      displayNotification(message);
    }
  });

  socket.on(START_GAME_NOTIFICATION, ({ inSeconds }: { inSeconds: number }) => {
    // Immediately set game start time
    setGameStartTime(Tone.now() + inSeconds);
    setView('duet.play');
    setRoomState((prevRoomState: RoomInfo) => {
      // server marks them as false when the game starts
      const unreadiedPlayers = prevRoomState.players.map(player => ({
        ...player,
        ready: false,
      }));

      return { ...prevRoomState, players: unreadiedPlayers };
    });
  });
}
export function removeRoomStateListeners() {
  socket.removeEventListener(CREATE_ROOM_RESPONSE);
  socket.removeEventListener(MALFORMED_MESSAGE_RESPONSE);
  socket.removeEventListener(UNKNOWN_MESSAGE_RESPONSE);
  socket.removeEventListener(JOIN_ROOM_RESPONSE);
  socket.removeEventListener(ROOM_INFO_UPDATED_NOTIFICATION);
  socket.removeEventListener(START_GAME_NOTIFICATION);
}

export function addNotePlayListener(
  handleNotePlayByFriend: (note: number) => void,
  handleNoteStopByFriend: (note: number) => void
) {
  socket.on(NOTE_PLAYED, ({ note, event }: NotePlayedMessage) => {
    // console.log(`Received ${event} event for note ${note}`);
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
  socket.emit(NOTE_PLAYED, { note, event: 'keydown' });
}

export function stopNote(note: number) {
  socket.emit(NOTE_PLAYED, { note, event: 'keyup' });
}

export const choosePart = (id: Part) => {
  socket.emit(CHOOSE_PART_REQUEST, { id });
};

export function choosePiece(id: number) {
  socket.emit(CHOOSE_PIECE_REQUEST, { id });
}

export function changeSpeed(speed: number) {
  socket.emit(CHANGE_SPEED_REQUEST, { speed });
}

export function updateReady(isReady: boolean) {
  socket.emit(READY_REQUEST, { ready: isReady });
}

export default socket;
