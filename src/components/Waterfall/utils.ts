import { Note } from './types';
import { FallingNote } from './FallingNote';

/*************** For time. ****************/
/**
 * Converts every time information of note in `notes` to milliseconds, assuming that the current information
 * is in seconds.
 */
export const convertTimeInfoToMilliseconds = (notes: Array<Note>) => {
  notes.forEach((note: Note) => {
    note.time *= 1000;
    note.duration *= 1000;
  });
};

/**
 * Calculates the amount of time we should look ahead by in milliseconds.
 *
 * In this case, we try to look ahead by one musical bar.
 */
export const calculateLookAheadTime = (bpm: number, beatsPerBar: number) => {
  // TODO: support non-quarter notes (need to define new variable)
  const NUM_MILLISECONDS_PER_MIN = 60000;
  return (NUM_MILLISECONDS_PER_MIN / bpm) * beatsPerBar;
};

/**
 * Delays the start time of each note in `notes` by `delay` milliseconds.
 *
 * @param {Array<note>} notes
 * @param {number} delay delay specified in milliseconds
 */
export const delayStartTime = (notes: Array<Note>, delay: number) => {
  notes.forEach((note: Note) => {
    note.time += delay;
  });
};

/*************** For animation. ****************/
/** Draws falling note given information of `note`. */
const drawFallingNote = (
  context: CanvasRenderingContext2D,
  note: FallingNote
) => {
  const GRADIENT_COLOUR_START = '#904AE9';
  const GRADIENT_COLOUR_END = '#7988FA';

  const startX = note.horizontalPos;
  const startY = note.verticalPos;

  const gradient = context.createLinearGradient(
    startX,
    startY,
    startX,
    startY + note.length
  );
  gradient.addColorStop(0, GRADIENT_COLOUR_START);
  gradient.addColorStop(1, GRADIENT_COLOUR_END);
  context.fillStyle = gradient;

  context.fillRect(startX, startY, note.width, note.length);
};

const MARGIN = 2;
export const startAnimation = (
  context: CanvasRenderingContext2D,
  canvasHeight: number,
  canvasWidth: number,
  speed: number,
  lookAheadTime: number,
  notes: Array<Note>,
  offsetMap: { [note: number]: number }
): void => {
  let isFirstTime = true;
  let fallingNotes: Array<FallingNote> = [];
  let firstHiddenNoteIndex = 0;
  let prevTime = 0;
  const animate = (timestamp: number) => {
    if (isFirstTime) {
      delayStartTime(notes, timestamp);
      prevTime = timestamp;
      isFirstTime = false;
    }

    const endWindowTime = timestamp + lookAheadTime;

    // check if we need to add more notes
    while (
      firstHiddenNoteIndex < notes.length &&
      notes[firstHiddenNoteIndex].time <= endWindowTime
    ) {
      const note = notes[firstHiddenNoteIndex];
      const fallingNoteLen = note.duration * speed;
      const horizontalPos = offsetMap[note.midi] + MARGIN;
      const width = offsetMap[note.midi + 1] - offsetMap[note.midi] - MARGIN;
      console.log(horizontalPos);
      console.log(horizontalPos);
      fallingNotes.push(
        new FallingNote(horizontalPos, width, fallingNoteLen, -fallingNoteLen)
      );
      firstHiddenNoteIndex += 1;
    }

    // check if we need to remove notes from fallingNotes
    fallingNotes = fallingNotes.filter((fallingNote: FallingNote) => {
      return fallingNote.verticalPos <= canvasHeight;
    });

    // update notes on canvas
    const timeElapsed = timestamp - prevTime;
    const distanceToMove = speed * timeElapsed;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    fallingNotes.forEach((fallingNote: FallingNote) => {
      fallingNote.moveVerticallyBy(distanceToMove);
      drawFallingNote(context, fallingNote);
    });

    if (fallingNotes.length > 0 || firstHiddenNoteIndex < notes.length) {
      prevTime = timestamp;
      window.requestAnimationFrame(animate);
    }
  };

  window.requestAnimationFrame(animate);
};
