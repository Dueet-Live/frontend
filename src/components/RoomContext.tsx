import React from 'react';
import { RoomInfo } from '../types/roomInfo';

type RoomContextProps = {
  timeToStart: number;
  isPlaying: boolean;
  roomInfo: RoomInfo;
  setRoomInfo: (usingPrevState: (prevState: RoomInfo) => RoomInfo) => void;
};

// this will likely be used for solo instead of duet
export const RoomContext = React.createContext<RoomContextProps>({
  timeToStart: 0,
  isPlaying: false,
  roomInfo: {
    id: '',
    piece: undefined,
    players: [],
  } as RoomInfo,
  setRoomInfo: () => {},
});
