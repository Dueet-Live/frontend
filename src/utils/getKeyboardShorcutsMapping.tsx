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
  [',', 'Q'],
  ['L', '2'],
  ['.', 'W'],
  [';', '3'],
  ['/', 'E'],
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

export default function getKeyboardShortcutsMapping(
  startNote: number,
  range: number
): { [key: string]: number } {
  let firstMappedKey = startNote;
  let offset = 0;
  // If start note is not C, find the next C
  if (startNote % 12 !== 0) {
    offset += 12 - (startNote % 12);
  }
  // If range exceeds, choose the middle two octaves to map
  if (range > 30) {
    offset += Math.floor(range / 12 / 2 - 1) * 12;
  }
  firstMappedKey += offset;

  const mapRange = Math.min(30, range - offset);
  const map: { [key: string]: number } = {};
  for (let i = 0; i < mapRange; i++) {
    const shortcutKeys = shortcuts[i];
    const note = firstMappedKey + i;
    shortcutKeys.forEach(shortcut => {
      map[shortcut] = note;
    });
  }
  return map;
}
