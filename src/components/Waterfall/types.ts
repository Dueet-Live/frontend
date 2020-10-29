export type TraditionalKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  whiteKeyWidth: number;
  blackKeyWidth: number;
};

export type SmartKeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  keyWidth: number;
};

export type KeyOffsetInfo =
  | ({ isSmart: true } & SmartKeyOffsetInfo)
  | ({ isSmart: false } & TraditionalKeyOffsetInfo);

/**
 * Note that does not have an actual midi value. Instead, it encapsulates an index, to which
 * the non-accidental version of the original note maps to.
 */
export type IndexedNote = {
  index: number;
  time: number;
  duration: number;
};
