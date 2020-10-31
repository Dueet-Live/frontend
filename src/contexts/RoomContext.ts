import React from 'react';
import { Score } from '../components/Game/types';
import { RoomInfo } from '../types/roomInfo';

export type RoomView =
  | 'solo.select'
  | 'solo.try'
  | 'solo.play'
  | 'solo.play.end'
  | 'duet.lobby'
  | 'duet.try'
  | 'duet.play'
  | 'duet.play.end';

type RoomContextProps = {
  roomInfo: RoomInfo;
  score: Score;
  view: RoomView;
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
  view: 'solo.select',
  score: { total: 0, correct: 0 },
  setRoomInfo: () => {},
});
