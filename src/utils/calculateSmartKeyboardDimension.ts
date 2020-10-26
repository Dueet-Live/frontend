import { SmartKeyboardDimension } from '../types/keyboardDimension';

const numOfSmartKeys = 7;
const referenceKeywidth = 100;
const maxKeyHeight = 100;

function calculateKeyWidth(screenWidth: number): number {
  return Math.min(referenceKeywidth, screenWidth / numOfSmartKeys);
}

export function calculateSmartKeyHeight(screenHeight: number): number {
  return Math.min(screenHeight * 0.2, maxKeyHeight);
}

export function calculateSmartKeyboardDimension(
  screenWidth: number
): SmartKeyboardDimension {
  const keyWidth = calculateKeyWidth(screenWidth);
  const margin = (screenWidth - keyWidth * numOfSmartKeys) / 2;
  return {
    leftMargin: margin,
    keyWidth: keyWidth,
  };
}

export function getOffsetMapForSmartKeyboard(
  dimension: SmartKeyboardDimension
) {
  const { leftMargin, keyWidth } = dimension;
  let currOffset = leftMargin;
  let map: { [index: number]: number } = {};
  map[0] = currOffset;
  for (let i = 1; i < 7; i += 1) {
    currOffset += keyWidth;
    map[i] = currOffset;
  }
  return map;
}
