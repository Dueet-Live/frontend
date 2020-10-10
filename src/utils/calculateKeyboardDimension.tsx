import isAccidentalNote from '../components/Piano/utils/isAccidentalNote';

// At least 2 octaves
export function calculateKeyboardRange(width: number): number {
  return Math.max(Math.floor((width / 50 / 8) * 12), 24);
}

// At most 50px
export function calculateKeyWidth(width: number): number {
  return Math.min(50, Math.floor(width / 24));
}

export function calculateBlackKeyWidth(whiteKeyWidth: number): number {
  return (whiteKeyWidth / 50) * 36;
}

export function calculateStartNote(range: number): number {
  const startNode = 60 - Math.floor(range / 2);
  if (isAccidentalNote(startNode)) {
    return startNode + 1;
  } else {
    return startNode;
  }
}
