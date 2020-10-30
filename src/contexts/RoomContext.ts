import React from 'react';
import { Score } from '../components/Game/types';
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
  score: Score;
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
  score: { total: 0, correct: 0 },
  setRoomInfo: () => {},
});
