import { Note } from '../../types/MidiJSON';
import isAccidentalNote from '../Piano/utils/isAccidentalNote';
import { TraditionalKeyOffsetInfo } from './types';

const MARGIN = 2;
export class FallingNote {
  midi: number;
  width: number;
  horizontalPos: number;
  length: number;
  verticalPos: number;
  fallingDistance: number;

  constructor(
    midi: number,
    width: number,
    horizontalPos: number,
    length: number,
    verticalPos: number,
    fallingDistance: number
  ) {
    this.midi = midi;
    this.width = width;
    this.horizontalPos = horizontalPos;
    this.length = length;
    this.verticalPos = verticalPos;
    this.fallingDistance = fallingDistance;
  }

  static createFromNoteInfo(
    note: Note,
    speed: number,
    fallingDistance: number,
    keyOffsetInfo: TraditionalKeyOffsetInfo,
    currentTime: number
  ) {
    const width =
      (isAccidentalNote(note.midi)
        ? keyOffsetInfo.blackKeyWidth
        : keyOffsetInfo.whiteKeyWidth) -
      MARGIN * 2;
    const horizontalPos = keyOffsetInfo.leftMarginMap[note.midi] + MARGIN;
    const length = note.duration * speed;
    const verticalPos = -length + (currentTime - note.time) * speed;
    return new FallingNote(
      note.midi,
      width,
      horizontalPos,
      length,
      verticalPos,
      fallingDistance
    );
  }

  /** Moves the note vertically by `distance` amount. */
  moveVerticallyBy(distance: number) {
    this.verticalPos += distance;
  }

  /**
   * Creates new falling notes based on current note but with updated information as specified in
   * `newFallingDistance` and `keyOffsetInfo`.
   */
  createWithUpdatedDimensionAndProgress(
    newFallingDistance: number,
    keyOffsetInfo: TraditionalKeyOffsetInfo
  ) {
    const verticalDistanceChangeRatio =
      this.fallingDistance / newFallingDistance;
    const verticalPos = this.verticalPos * verticalDistanceChangeRatio;
    const length = this.length * verticalDistanceChangeRatio;
    const width =
      (isAccidentalNote(this.midi)
        ? keyOffsetInfo.blackKeyWidth
        : keyOffsetInfo.whiteKeyWidth) -
      MARGIN * 2;
    const horizontalPos = keyOffsetInfo.leftMarginMap[this.midi] + MARGIN;
    return new FallingNote(
      this.midi,
      width,
      horizontalPos,
      length,
      verticalPos,
      newFallingDistance
    );
  }
}
