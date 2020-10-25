import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import {
  calculateBlackKeyWidth,
  getOffsetMap,
} from '../../utils/calculateTraditionalKeyboardDimension';
import { Dimensions } from '../../utils/useDimensions';
import { FallingNote } from './FallingNote';
import { MidiInfo } from './types';
import {
  calculateLookAheadTime,
  convertTimeInfoToMilliseconds,
  drawFallingNote,
} from './utils';
import * as Tone from 'tone';
import { Note } from '../../types/MidiJSON';

type Props = MidiInfo & {
  keyboardDimension: TraditionalKeyboardDimension;
  waterfallDimension: Dimensions;
  startTime?: number;
};

const useStyles = makeStyles(theme => ({
  canvas: {
    display: 'block',
  },
}));

export const Waterfall: React.FC<Props> = ({
  startTime = 0,
  keyboardDimension,
  waterfallDimension,
  bpm,
  beatsPerBar,
  noteDivision,
  notes,
}) => {
  const classes = useStyles();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notesInMs = useRef<Array<Note>>(convertTimeInfoToMilliseconds(notes));
  const animationId = useRef(0);
  const prevFrameTime = useRef(Tone.now());
  const firstHiddenNoteIndex = useRef(0);
  const fallingNotes = useRef<Array<FallingNote>>([]);

  const lookAheadTime = calculateLookAheadTime(bpm, beatsPerBar, noteDivision);

  const keyOffsetInfo = useMemo(() => {
    const { start, range, keyWidth } = keyboardDimension;
    return {
      leftMarginMap: getOffsetMap(start, range, keyWidth),
      whiteKeyWidth: keyWidth,
      blackKeyWidth: calculateBlackKeyWidth(keyWidth),
    };
  }, [keyboardDimension]);

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }
    if (canvas.height <= 0 || canvas.width <= 0) {
      return;
    }

    const speed = canvas.height / lookAheadTime;

    const animate = () => {
      const timestamp = Tone.now() * 1000;

      // check if we need to add more notes
      while (
        firstHiddenNoteIndex.current < notesInMs.current.length &&
        notesInMs.current[firstHiddenNoteIndex.current].time <=
        timestamp - startTime
      ) {
        const note = notesInMs.current[firstHiddenNoteIndex.current];
        const newNote = FallingNote.createFromNoteInfo(
          note,
          speed,
          canvas.height,
          keyOffsetInfo,
          prevFrameTime.current - startTime
        );
        fallingNotes.current.push(newNote);
        firstHiddenNoteIndex.current += 1;
      }

      // check if we need to remove notes from fallingNotes
      fallingNotes.current = fallingNotes.current.filter(
        (fallingNote: FallingNote) => fallingNote.verticalPos <= canvas.height
      );

      // update notes on canvas
      const timeElapsed = timestamp - prevFrameTime.current;
      const distanceToMove = speed * timeElapsed;
      context.clearRect(0, 0, canvas.width, canvas.height);
      fallingNotes.current.forEach((fallingNote: FallingNote) => {
        fallingNote.moveVerticallyBy(distanceToMove);
        drawFallingNote(context, fallingNote);
      });

      if (
        fallingNotes.current.length > 0 ||
        firstHiddenNoteIndex.current < notesInMs.current.length
      ) {
        prevFrameTime.current = timestamp;
        animationId.current = window.requestAnimationFrame(animate);
      }
    };

    animationId.current = window.requestAnimationFrame(animate);
  }, [keyOffsetInfo, lookAheadTime, startTime]);

  useEffect(() => {
    startAnimation();
    return () => {
      cancelAnimationFrame(animationId.current);
      animationId.current = 0;
    };
  }, [lookAheadTime, startAnimation]);

  useEffect(() => {
    fallingNotes.current = fallingNotes.current.map(
      (fallingNote: FallingNote) =>
        fallingNote.createWithUpdatedDimensionAndProgress(
          canvasRef.current!.height,
          keyOffsetInfo
        )
    );
    startAnimation();
    return () => {
      cancelAnimationFrame(animationId.current);
      animationId.current = 0;
    };
  }, [keyOffsetInfo, startAnimation]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={classes.canvas}
        height={waterfallDimension.height}
        width={waterfallDimension.width}
      >
        Unable to render the required visuals on this browser ): Perhaps, switch
        to another browser?
      </canvas>
    </>
  );
};
