import isAccidentalNote from '../components/Piano/utils/isAccidentalNote';

const totalKeyMargin = 0; // Fixed, once updated, update the css as well
const octaveShiftKeyWidth = 30; // Fixed, once updated, update the css as well
const referenceCenterNote = 60; // C4
const minRange = 24; // 2 Octaves
const referenceKeywidth = 50;
const octageRange = 12;

/********************* DEFAULT MODE **************************************/
/* Before game play */
/* Assumption: startNote is always C */
function calculateKeyboardRange(totalWidth: number): number {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const maxOctaves = calculateMaxOctaves(keyboardWidth);
  return Math.max(calculateRange(maxOctaves), minRange);
}

function calculateKeyWidth(totalWidth: number): number {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const octaves = calculateNumberOfOctaves(calculateKeyboardRange(totalWidth));
  return keyboardWidth / (octaves * 7) - totalKeyMargin;
}

// Try to center referenceCenterNote (C4)
function calculateStartNote(range: number): number {
  const octaves = calculateNumberOfOctaves(range);
  // If odd octaves, show one more higher octave
  return referenceCenterNote - calculateRange(Math.floor(octaves / 2));
}

// Returns the { start, range, keyWidth }
export function calculateDefaultPianoDimension(totalWidth: number) {
  const range = calculateKeyboardRange(totalWidth);
  return {
    start: calculateStartNote(range),
    range: range,
    keyWidth: calculateKeyWidth(totalWidth),
  };
}

/******************************* GAME MODE ******************************/

/******************  Desktop **********************/
/* Assume regularStartNote is C */
/* RegularStartNote is the first mapped note on the screen */
/* At least 3 octaves on screen */

function calculateKeyboardRangeWithRegularStartNote(
  totalWidth: number,
  startNote: number
) {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const maxOctaves = calculateMaxOctaves(keyboardWidth);
  return Math.max(
    Math.min(108 - startNote, calculateRange(maxOctaves)),
    minRange
  );
}

function calculateKeyWidthWithRegularStartNote(
  totalWidth: number,
  range: number
) {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const octaves = calculateNumberOfOctaves(range);
  return keyboardWidth / (octaves * 7) - totalKeyMargin;
}

function calculateStartNoteWithRegularStartNote(
  totalWidth: number,
  regularStartNote: number
) {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const maxOctaves = calculateMaxOctaves(keyboardWidth);
  if (maxOctaves === 7) {
    return 24;
  } else if (maxOctaves === 6) {
    return Math.max(24, regularStartNote - 24);
  } else if (maxOctaves === 5 || maxOctaves === 4) {
    return Math.max(24, regularStartNote - 12);
  } else {
    return regularStartNote;
  }
}

/******************  Mobile **********************/
/* SmallStartNote might not be C */
/* SmallStartNote is the leftmost key on the screen (which is the actual start note) */
/* Exactly 2 octaves */
function calculateKeyWidthWithSmallStartNote(
  totalWidth: number,
  smallStartNote: number
) {
  const keyboardWidth = calculateKeyboardWidth(totalWidth);
  const range = calculateKeyboardRangeWithRegularStartNote(
    totalWidth,
    smallStartNote
  );
  let whiteKeys = 0;
  for (let i = 0; i < range; i++) {
    if (!isAccidentalNote(smallStartNote + i)) {
      whiteKeys += 1;
    }
  }
  return keyboardWidth / whiteKeys - totalKeyMargin;
}

/******************  Overall **********************/
// Returns the { start, range, keyWidth }
export function calculateGamePianoDimension(
  totalWidth: number,
  smallStartNote: number,
  regularStartNote: number
) {
  if (calculateMaxOctaves(calculateKeyboardWidth(totalWidth)) <= 2) {
    // Use small start note
    return {
      start: smallStartNote,
      range: 24,
      keyWidth: calculateKeyWidthWithSmallStartNote(totalWidth, smallStartNote),
    };
  } else {
    // Use regular start note
    const startNote = calculateStartNoteWithRegularStartNote(
      totalWidth,
      regularStartNote
    );
    const range = calculateKeyboardRangeWithRegularStartNote(
      totalWidth,
      startNote
    );
    return {
      start: startNote,
      range: range,
      keyWidth: calculateKeyWidthWithRegularStartNote(totalWidth, range),
    };
  }
}

export function getOffsetMap(
  startNote: number,
  range: number,
  keyWidth: number
) {
  let currOffset = 0;
  let map: { [note: number]: number } = {};
  map[startNote] = 0;
  for (let i = 1; i < range; i += 1) {
    // If previous key is black key
    if (isAccidentalNote(startNote + i - 1)) {
      currOffset += calculateBlackKeyWidth(keyWidth) / 2;
    } else {
      // If previous is white and current is black
      if (isAccidentalNote(startNote + i)) {
        currOffset += keyWidth - calculateBlackKeyWidth(keyWidth) / 2;
      } else {
        currOffset += keyWidth;
      }
    }
    map[startNote + i] = currOffset;
  }
  return map;
}

/******************************* HELPERS ******************************/
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

function calculateMaxOctaves(keyboardWidth: number): number {
  // Fit in as many octaves as possible
  return Math.floor(keyboardWidth / (referenceKeywidth + totalKeyMargin) / 7);
}
