export class FallingNote {
  width: number;
  horizontalPos: number;
  length: number;
  verticalPos: number;

  constructor(
    horizontalPos: number,
    width: number,
    length: number,
    verticalPos: number
  ) {
    this.width = width;
    this.horizontalPos = horizontalPos;
    this.length = length;
    this.verticalPos = verticalPos;
  }

  /** Moves the note vertically by `distance` amount. */
  moveVerticallyBy(distance: number) {
    this.verticalPos += distance;
  }
}
