import { Part } from '../types/messages';
import { RoomInfo } from '../types/roomInfo';

export function getFriendId(roomState: RoomInfo, myId: number) {
  const players = roomState.players;
  if (!players) {
    return null;
  }
  const friendInfo = players.filter(player => player.id !== myId);
  if (friendInfo.length === 0) {
    return null;
  } else {
    return friendInfo[0].id;
  }
}

export function getParts(roomState: RoomInfo, myId: number) {
  const players = roomState.players;
  let me: Part | null = null;
  let friend: Part | null = null;
  if (!players) return { me, friend };

  for (const player of players) {
    const part = player.assignedPart || null;
    if (player.id === myId) {
      me = part;
    } else {
      friend = part;
    }
  }
  return { me, friend };
}

export function getReady(roomState: RoomInfo, myId: number) {
  const players = roomState.players;
  if (!players) {
    return { me: false, friend: false };
  }

  let me = false;
  let friend = false;
  for (const player of roomState.players) {
    if (player.id === myId) {
      me = player.ready;
    } else {
      friend = player.ready;
    }
  }

  return { me, friend };
}
