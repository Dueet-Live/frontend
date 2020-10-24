import { Note } from '../../types/MidiJSON';
import { FallingNote } from './FallingNote';

/*************** For time. ****************/
/**
 * Converts every time information of note in `notes` to milliseconds, assuming that the current information
 * is in seconds.
 */
export const convertTimeInfoToMilliseconds = (
  notes: Array<Note>
): Array<Note> => {
  return notes.map(note =>
    Object.assign({}, note, {
      time: note.time * 1000,
      duration: note.duration * 1000,
    })
  );
};

const DEFAULT_NOTE_DIVISION = 4;
/**
 * Calculates the amount of time we should look ahead by in milliseconds.
 *
 * In this case, we try to look ahead by one musical bar.
 */
export const calculateLookAheadTime = (
  bpm: number,
  beatsPerBar: number,
  noteDivision: number
) => {
  const NUM_MILLISECONDS_PER_MIN = 60000;
  return (
    (NUM_MILLISECONDS_PER_MIN / bpm) *
    beatsPerBar *
    (DEFAULT_NOTE_DIVISION / noteDivision)
  );
};

/**
 * Delays the start time of each note in `notes` by `delay` milliseconds.
 *
 * @param {Array<note>} notes
 * @param {number} delay delay specified in milliseconds
 * @return New array of notes with delayed start time as specified by `delay`.
 */
export const delayStartTime = (
  notes: Array<Note>,
  delay: number
): Array<Note> => {
  return notes.map(note =>
    Object.assign({}, note, { time: note.time + delay })
  );
};

/*************** For animation. ****************/
/** Draws falling note given information of `note`. */
export const drawFallingNote = (
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
