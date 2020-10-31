import { Note } from '../../types/MidiJSON';
import isAccidentalNote from '../Piano/utils/isAccidentalNote';
import {
  IndexedNote,
  KeyOffsetInfo,
  SmartKeyOffsetInfo,
  TraditionalKeyOffsetInfo,
} from './types';

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

  static createFromIndexedNoteInfo(
    note: IndexedNote,
    speed: number,
    fallingDistance: number,
    keyOffsetInfo: SmartKeyOffsetInfo,
    currentTime: number
  ) {
    const { index, time, duration } = note;
    const { keyWidth, leftMarginMap } = keyOffsetInfo;
    if (leftMarginMap[index] === undefined) {
      console.error('indexed falling note out of range', note, leftMarginMap);
    }
    const width = keyWidth - MARGIN * 2;
    const horizontalPos = leftMarginMap[index] + MARGIN;
    const length = duration * speed;
    const verticalPos = -length + (currentTime - time) * speed;
    return new FallingNote(
      index,
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
    const { midi, time, duration } = note;
    const { blackKeyWidth, whiteKeyWidth, leftMarginMap } = keyOffsetInfo;
    if (leftMarginMap[note.midi] === undefined) {
      console.error('falling note out of range', note, leftMarginMap);
    }
    const width =
      (isAccidentalNote(midi) ? blackKeyWidth : whiteKeyWidth) - MARGIN * 2;
    const horizontalPos = leftMarginMap[midi] + MARGIN;
    const length = duration * speed;
    const verticalPos = -length + (currentTime - time) * speed;
    return new FallingNote(
      midi,
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
    keyOffsetInfo: KeyOffsetInfo
  ) {
    const verticalDistanceChangeRatio =
      newFallingDistance / this.fallingDistance;
    const verticalPos = this.verticalPos * verticalDistanceChangeRatio;
    const length = this.length * verticalDistanceChangeRatio;
    const { leftMarginMap } = keyOffsetInfo;
    const horizontalPos = leftMarginMap[this.identifier] + MARGIN;
    let width: number;
    if (keyOffsetInfo.isSmart) {
      const { keyWidth } = keyOffsetInfo;
      width = keyWidth - MARGIN * 2;
    } else {
      const { blackKeyWidth, whiteKeyWidth } = keyOffsetInfo;
      width =
        (isAccidentalNote(this.identifier) ? blackKeyWidth : whiteKeyWidth) -
        MARGIN * 2;
    }
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
