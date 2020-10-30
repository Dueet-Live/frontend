import React from 'react';
import { RoomInfo } from '../types/roomInfo';

export type RoomView =
  | 'solo.select'
  | 'solo.try'
  | 'solo.play'
  | 'duet.lobby'
  | 'duet.try'
  | 'duet.play';

type RoomContextProps = {
  roomInfo: RoomInfo;
  setRoomInfo: (usingPrevState: (prevState: RoomInfo) => RoomInfo) => void;
};

// this will likely be used for solo instead of duet
export const RoomContext = React.createContext<RoomContextProps>({
  roomInfo: {
    id: '',
    piece: undefined,
    speed: 1,
    players: [],
  },
  setRoomInfo: () => {},
});
