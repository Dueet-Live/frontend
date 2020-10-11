const totalKeyMargin = 4; // Fixed, once updated, update the css as well
const octaveShiftKeyWidth = 30; // Fixed, once updated, update the css as well
const referenceCenterNote = 60; // C4
const minRange = 24; // 2 Octaves
const referenceKeywidth = 50;
const octageRange = 12;

export function calculateKeyboardRange(totalWidth: number): number {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const maxOctaves = calculateMaxOctaves(keyboardWidth);
  return Math.max(calculateRange(maxOctaves), minRange);
}

export function calculateKeyWidth(totalWidth: number): number {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const octaves = calculateNumberOfOctaves(calculateKeyboardRange(totalWidth));
  return keyboardWidth / (octaves * 7) - totalKeyMargin;
}

// Set white-black key width ratio here
export function calculateBlackKeyWidth(whiteKeyWidth: number): number {
  return (whiteKeyWidth / 50) * 36;
}

export function calculateStartNote(range: number): number {
  const octaves = calculateNumberOfOctaves(range);
  // If odd octaves, show one more higher octave
  return referenceCenterNote - calculateRange(Math.floor(octaves / 2));
}

function calculateKeyboardWidth(totalWidth: number): number {
  return totalWidth - octaveShiftKeyWidth * 2;
}

function calculateMaxOctaves(keyboardWidth: number): number {
  // Try to fit in as many octaves as possible
  return Math.floor(keyboardWidth / (referenceKeywidth + totalKeyMargin) / 7);
}

function calculateNumberOfOctaves(range: number): number {
  return range / octageRange;
}

function calculateRange(octaves: number): number {
  return octaves * octageRange;
}
