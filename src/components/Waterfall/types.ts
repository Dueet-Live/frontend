export type Note = {
  time: number;
  duration: number;
  midi: number;
};

export type KeyboardDimension = {
  start: number;
  range: number;
  keyWidth: number;
};

export type KeyOffsetInfo = {
  leftMarginMap: { [note: number]: number };
  whiteKeyWidth: number;
  blackKeyWidth: number;
};
