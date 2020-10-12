import React from 'react';
import { RoomInfo } from '../types/RoomInfo';

type RoomContextProps = {
  roomInfo: RoomInfo;
  setRoomInfo: (usingPrevState: (prevState: RoomInfo) => RoomInfo) => void;
};

export const RoomContext = React.createContext<RoomContextProps>({
  roomInfo: {
    id: '',
    piece: undefined,
    players: [],
  } as RoomInfo,
  setRoomInfo: () => {},
});
