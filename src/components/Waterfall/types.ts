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
