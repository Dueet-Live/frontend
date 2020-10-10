import { PlayerInfo } from './PlayerInfo';

export type RoomInfo = {
  id: string;
  piece?: string;
  players: PlayerInfo[];
};
