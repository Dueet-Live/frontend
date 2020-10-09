import { RoomInfo } from './RoomInfo';

/*************** Create room ***************/
export const CREATE_ROOM_REQUEST = 'createRoomRequest';

// eslint-disable-next-line @typescript-eslint/ban-types
export type CreateRoomRequest = {};

export const CREATE_ROOM_RESPONSE = 'createRoomResponse';
export type RoomCreatedResponse = {
  roomId: string;
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

/****************** Miscellaneous *****************/
export const MALFORMED_MESSAGE_RESPONSE = 'malformedMessageResponse';
export type MalformedMessageResponse = {
  message: string;
};

export const UNKNOWN_MESSAGE_RESPONSE = 'unknownMessageResponse';
export type UnknownErrorResponse = {
  error: string;
};
