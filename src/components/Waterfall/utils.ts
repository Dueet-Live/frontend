import { Header, Note } from '../../types/MidiJSON';
import { getPrefixOfNote } from '../../utils/getPrefixOfNote';
import { getNoteNamePrefixToIndexMap } from '../../utils/getNoteNamePrefixToIndexMap';
import { FallingNote } from './FallingNote';
import { IndexedNote } from './types';

const DEFAULT_NOTE_DIVISION = 4;
/**
 * Calculates the amount of time we should look ahead by in seconds.
 *
 * In this case, we try to look ahead by one musical bar.
 */
export const calculateLookAheadTime = (header: Header) => {
  const { tempos, timeSignatures } = header;
  const bpm = tempos[0].bpm;
  const [beatsPerBar, noteDivision] = timeSignatures[0].timeSignature;
  return (60 / bpm) * beatsPerBar * (DEFAULT_NOTE_DIVISION / noteDivision);
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

  drawRoundRect(context, startX, startY, note.width, note.length, 5);
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const borderRadius = { tl: radius, tr: radius, br: radius, bl: radius };

  ctx.beginPath();
  ctx.moveTo(x + borderRadius.tl, y);
  ctx.lineTo(x + width - borderRadius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius.tr);
  ctx.lineTo(x + width, y + height - borderRadius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - borderRadius.br,
    y + height
  );
  ctx.lineTo(x + borderRadius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius.bl);
  ctx.lineTo(x, y + borderRadius.tl);
  ctx.quadraticCurveTo(x, y, x + borderRadius.tl, y);
  ctx.closePath();

  ctx.fill();
};

export const getIndexedNotesFromNotes = (notes: Note[]) => {
  const notePrefixToIndexMap = getNoteNamePrefixToIndexMap();
  return notes.map(note => {
    const notePrefix = getPrefixOfNote(note.name);
    return {
      index: notePrefixToIndexMap.get(notePrefix),
      time: note.time,
      duration: note.duration,
    } as IndexedNote;
  });
};
