import { Part } from './messages';

export interface PlayerInfo {
  id: number;
  assignedPart?: Part;
  ready: boolean;
}
