import { PlayerInfo } from './playerInfo';

export type RoomInfo = {
  id: string;
  piece?: number;
  speed: number;
  players: PlayerInfo[];
};
