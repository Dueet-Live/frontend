import { TraditionalKeyboardDimension } from '../types/keyboardDimension';

const shortcutsForTraditionalPiano = [
  ['Z'],
  ['S'],
  ['X'],
  ['D'],
  ['C'],
  ['V'],
  ['G'],
  ['B'],
  ['H'],
  ['N'],
  ['J'],
  ['M'],
  ['Q', ','],
  ['2', 'L'],
  ['W', '.'],
  ['3', ';'],
  ['E', '/'],
  ['R'],
  ['5'],
  ['T'],
  ['6'],
  ['Y'],
  ['7'],
  ['U'],
  ['I'],
  ['9'],
  ['O'],
  ['0'],
  ['P'],
  ['['],
];

// DEFAULT MODE
// Always center the mappings
export function getKeyboardMapping(
  startNote: number, // the leftmost note on screen
  range: number
): { [key: string]: number } {
  let firstMappedNote = startNote;
  let offset = 0;
  // If start note is not C, find the next C
  if (startNote % 12 !== 0) {
    offset += 12 - (startNote % 12);
  }
  // If range exceeds, choose the middle two octaves to map
  if (range > 30) {
    offset += Math.floor(range / 12 / 2 - 1) * 12;
  }
  firstMappedNote += offset;

  const mapRange = Math.min(30, range - offset);
  const map: { [key: string]: number } = {};
  for (let i = 0; i < mapRange; i++) {
    const shortcutKeys = shortcutsForTraditionalPiano[i];
    const note = firstMappedNote + i;
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = note;
    });
  }
  return map;
}

// GAME MODE - Traditional Piano (desktop view only)
// Assume the start note and first mapped note are both C here
export function getKeyboardMappingWithSpecificStart(
  firstMappedNote: number,
  keyboardDimension: TraditionalKeyboardDimension
): { [key: string]: number } {
  const { start, range } = keyboardDimension;
  const mapRange = Math.min(30, range - (firstMappedNote - start));
  const map: { [key: string]: number } = {};
  for (let i = 0; i < mapRange; i++) {
    const shortcutKeys = shortcutsForTraditionalPiano[i];
    const note = firstMappedNote + i;
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = note;
    });
  }
  return map;
}

export function getKeyboardShortcutForNote(
  keyboardMap: { [key: string]: number },
  note: number
) {
  const keyboardShortcuts = Object.keys(keyboardMap);
  return keyboardShortcuts.filter(shortcut => keyboardMap[shortcut] === note);
}

const shortcutsForSmartPiano = [
  ['A'],
  ['S'],
  ['D'],
  ['F'],
  ['G'],
  ['H'],
  ['J'],
];

// GAME MODE - Smart Piano (desktop view only)
export const getSmartKeyboardMapping = () => {
  const map: { [key: string]: number } = {};
  for (let i = 0; i < 7; i++) {
    const shortcutKeys = shortcutsForSmartPiano[i];
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = i;
    });
  }
  return map;
};
