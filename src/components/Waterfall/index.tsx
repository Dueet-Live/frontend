import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  calculateBlackKeyWidth,
  getOffsetMap,
} from '../../utils/calculateKeyboardDimension';
import { Dimensions } from '../../utils/useDimensions';
import { FallingNote } from './FallingNote';
import { KeyboardDimension, KeyOffsetInfo, Note } from './types';
import {
  calculateLookAheadTime,
  convertTimeInfoToMilliseconds,
  delayStartTime,
  drawFallingNote,
} from './utils';

type Props = KeyboardDimension & {
  bpm: number;
  beatsPerBar: number; // TODO: add info about whether beat = half/quarter/eigth note etc.
  notes: Array<Note>;
  dimension: Dimensions;
};

const useStyles = makeStyles(theme => ({
  canvas: {
    display: 'block',
  },
}));

export const Waterfall: React.FC<Props> = ({
  start,
  range,
  keyWidth,
  dimension,
  bpm,
  beatsPerBar,
  notes,
}) => {
  const classes = useStyles();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notesInMs = useRef<Array<Note>>(convertTimeInfoToMilliseconds(notes));
  const animationId = useRef(0);
  const prevFrameTime = useRef(0);
  const isPaused = useRef(true);
  const firstHiddenNoteIndex = useRef(0);
  const fallingNotes = useRef<Array<FallingNote>>([]);

  const lookAheadTime = calculateLookAheadTime(bpm, beatsPerBar);
  const keyOffsetInfo = useMemo(
    () =>
      ({
        leftMarginMap: getOffsetMap(start, range, keyWidth),
        whiteKeyWidth: keyWidth,
        blackKeyWidth: calculateBlackKeyWidth(keyWidth),
      } as KeyOffsetInfo),
    [keyWidth, range, start]
  );

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

    const animate = (timestamp: number) => {
      if (isPaused.current) {
        notesInMs.current = delayStartTime(notesInMs.current, timestamp);
        prevFrameTime.current = timestamp;
        isPaused.current = false;
      }
      const endWindowTime = timestamp + lookAheadTime;

      // check if we need to add more notes
      while (
        firstHiddenNoteIndex.current < notesInMs.current.length &&
        notesInMs.current[firstHiddenNoteIndex.current].time <= endWindowTime
      ) {
        const note = notesInMs.current[firstHiddenNoteIndex.current];
        fallingNotes.current.push(
          FallingNote.createFromNoteInfo(
            note,
            speed,
            canvas.height,
            keyOffsetInfo
          )
        );
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
  }, [keyOffsetInfo, lookAheadTime]);

  useEffect(() => {
    notesInMs.current = delayStartTime(notesInMs.current, lookAheadTime); // 'count in one bar'
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
      {/* Dirty hack */}
      <canvas
        ref={canvasRef}
        className={classes.canvas}
        height={dimension.height}
        width={dimension.width}
      >
        Unable to render the required visuals on this browser ): Perhaps, switch
        to another browser?
      </canvas>
    </>
  );
};
