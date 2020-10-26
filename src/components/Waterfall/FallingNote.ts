import { Note, SmartNote } from '../../types/MidiJSON';
import isAccidentalNote from '../Piano/utils/isAccidentalNote';
import { SmartKeyOffsetInfo, TraditionalKeyOffsetInfo } from './types';

const MARGIN = 2;
export class FallingNote {
  identifier: number; // Midi for normal note, smartKey for smart note
  width: number;
  horizontalPos: number;
  length: number;
  verticalPos: number;
  fallingDistance: number;

  constructor(
    identifier: number,
    width: number,
    horizontalPos: number,
    length: number,
    verticalPos: number,
    fallingDistance: number
  ) {
    this.identifier = identifier;
    this.width = width;
    this.horizontalPos = horizontalPos;
    this.length = length;
    this.verticalPos = verticalPos;
    this.fallingDistance = fallingDistance;
  }

  static createFromSmartNoteInfo(
    note: SmartNote,
    speed: number,
    fallingDistance: number,
    keyOffsetInfo: SmartKeyOffsetInfo,
    currentTime: number
  ) {
    const { keyWidth, leftMarginMap } = keyOffsetInfo;
    if (leftMarginMap[note.smartKey] === undefined) {
      console.log('falling note our of range');
    }
    const width = keyWidth - MARGIN * 2;
    const horizontalPos = leftMarginMap[note.smartKey] + MARGIN;
    const length = note.duration * speed;
    const verticalPos = -length + (currentTime - note.time) * speed;
    return new FallingNote(
      note.smartKey,
      width,
      horizontalPos,
      length,
      verticalPos,
      fallingDistance
    );
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
    keyOffsetInfo: SmartKeyOffsetInfo
  ) {
    const verticalDistanceChangeRatio =
      this.fallingDistance / newFallingDistance;
    const verticalPos = this.verticalPos * verticalDistanceChangeRatio;
    const length = this.length * verticalDistanceChangeRatio;
    const { keyWidth, leftMarginMap } = keyOffsetInfo;
    const width = keyWidth - MARGIN * 2;
    const horizontalPos = leftMarginMap[this.identifier] + MARGIN;
    return new FallingNote(
      this.identifier,
      width,
      horizontalPos,
      length,
      verticalPos,
      newFallingDistance
    );
  }
}
