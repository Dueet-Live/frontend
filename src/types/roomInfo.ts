import { PlayerInfo } from './playerInfo';

export type RoomInfo = {
  id: string;
  piece?: number;
  players: PlayerInfo[];
};
