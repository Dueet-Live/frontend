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

export function getPartsSelection(roomState: RoomInfo) {
  const primo: number[] = [];
  const secondo: number[] = [];

  const players = roomState.players;
  if (!players) {
    return { primo, secondo };
  }

  for (const player of roomState.players) {
    if (player.assignedPart === 'primo') {
      primo.push(player.id);
    } else if (player.assignedPart === 'secondo') {
      secondo.push(player.id);
    }
  }
  return { primo, secondo };
}

export function getMyPart(roomState: RoomInfo, myId: number) {
  const players = roomState.players;
  if (!players) return null;

  for (const player of players) {
    if (player.id === myId) {
      return player.assignedPart;
    }
  }
  // this should never happen
  return null;
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
