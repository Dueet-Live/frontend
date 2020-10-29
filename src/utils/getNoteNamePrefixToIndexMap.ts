const NOTE_NAME_PREFIXES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Gets the map which maps every non-accidental note to an index which ranges
 * from 0 to 6 (inclusive).
 */
export const getNoteNamePrefixToIndexMap = () =>
  new Map(NOTE_NAME_PREFIXES.map((prefix, index) => [prefix, index]));
