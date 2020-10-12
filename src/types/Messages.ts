import { RoomInfo } from './RoomInfo';

/*************** Create room ***************/
export const CREATE_ROOM_REQUEST = 'createRoomRequest';

// eslint-disable-next-line @typescript-eslint/ban-types
export type CreateRoomRequest = {};

export const CREATE_ROOM_RESPONSE = 'createRoomResponse';
export type RoomCreatedResponse = {
  roomInfo: RoomInfo;
  playerId: number;
};

/********************* Join room ****************/
export const JOIN_ROOM_REQUEST = 'joinRoomRequest';

export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';

export type JoinRoomSuccessResponse = {
  playerId: number;
  roomInfo: RoomInfo;
};

export type JoinRoomRequest = { roomId: string };

export type JoinRoomFailureResponse = {
  code: number;
  message: string;
};

export type JoinRoomResponse =
  | ({ success: true } & JoinRoomSuccessResponse)
  | ({ success: false } & JoinRoomFailureResponse);

/****************** Room info updated **********************/

export const ROOM_INFO_UPDATED_NOTIFICATION = 'roomInfoUpdatedNotification';

/****************** Choose piece **********************/

// Request
export const CHOOSE_PIECE_REQUEST = 'choosePieceRequest';
export type ChoosePieceRequest = {
  id: string;
};

/****************** Choose part **********************/

// Request
export const CHOOSE_PART_REQUEST = 'choosePartRequest';
export type Part = 'primo' | 'secondo';
export type ChoosePartRequest = {
  id: Part;
};

/****************** Ready *****************/

export const READY_REQUEST = 'readyRequest';
export type ReadyRequest = {
  ready: boolean;
};

/****************** Start game *****************/

export const START_GAME_NOTIFICATION = 'startGameNotification';
export type StartGameNotification = {
  inSeconds: number;
};

/****************** Note played *****************/

export const NOTE_PLAYED = 'notePlayed';
export type NotePlayEvent = 'keyup' | 'keydown';
export type NotePlayedMessage = {
  note: number;
  event: NotePlayEvent;
};

/****************** Miscellaneous *****************/
export const MALFORMED_MESSAGE_RESPONSE = 'malformedMessageResponse';
export type MalformedMessageResponse = {
  message: string;
};

export const UNKNOWN_MESSAGE_RESPONSE = 'unknownMessageResponse';
export type UnknownErrorResponse = {
  error: string;
};
