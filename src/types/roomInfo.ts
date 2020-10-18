import { PlayerInfo } from './playerInfo';

export type RoomInfo = {
  id: string;
  piece?: string;
  players: PlayerInfo[];
};
