import { PlayerInfo } from './PlayerInfo';

export type RoomInfo = {
  id: string;
  piece?: number;
  players: PlayerInfo[];
};
