const totalKeyMargin = 0; // Fixed, once updated, update the css as well
const octaveShiftKeyWidth = 30; // Fixed, once updated, update the css as well
const referenceCenterNote = 60; // C4
const minRange = 24; // 2 Octaves
const referenceKeywidth = 50;
const octageRange = 12;

/* CASUAL MODE */
/* Assumption: startNote is always C */
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

export function calculateStartNote(range: number): number {
  const octaves = calculateNumberOfOctaves(range);
  // If odd octaves, show one more higher octave
  return referenceCenterNote - calculateRange(Math.floor(octaves / 2));
}

function calculateMaxOctaves(keyboardWidth: number): number {
  // Try to fit in as many octaves as possible
  return Math.floor(keyboardWidth / (referenceKeywidth + totalKeyMargin) / 7);
}

/* GAME MODE */
/* Start note might not be C */

/* HELPERS */
function calculateKeyboardWidth(totalWidth: number): number {
  return totalWidth - octaveShiftKeyWidth * 2;
}

export function calculateKeyHeight(screenHeight: number): number {
  return Math.min(screenHeight * 0.4, 180);
}

// Set white-black key width ratio here
export function calculateBlackKeyWidth(whiteKeyWidth: number): number {
  return (whiteKeyWidth / 50) * 40;
}

// Set white-black key height ratio here
export function calculateBlackKeyHeight(whiteKeyHeight: number): number {
  return (whiteKeyHeight / 5) * 3;
}

function calculateNumberOfOctaves(range: number): number {
  return range / octageRange;
}

function calculateRange(octaves: number): number {
  return octaves * octageRange;
}
