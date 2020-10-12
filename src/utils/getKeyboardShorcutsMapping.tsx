const shortcuts = [
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

// CASUAL MODE
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
    const shortcutKeys = shortcuts[i];
    const note = firstMappedNote + i;
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = note;
    });
  }
  return map;
}

// GAME MODE (desktop view)
// Assume the start note and first mapped note are both C here
export function getKeyboardMappingWithSpecificStart(
  firstMappedNote: number,
  startNote: number,
  range: number
): { [key: string]: number } {
  const mapRange = Math.min(30, range - (firstMappedNote - startNote));
  const map: { [key: string]: number } = {};
  for (let i = 0; i < mapRange; i++) {
    const shortcutKeys = shortcuts[i];
    const note = firstMappedNote + i;
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = note;
    });
  }
  return map;
}
