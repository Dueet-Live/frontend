import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  SmartKeyboardDimension,
  TraditionalKeyboardDimension,
} from '../../types/keyboardDimension';
import { Dimensions } from '../../utils/useDimensions';
import { FallingNote } from './FallingNote';
import {
  KeyOffsetInfo,
  SmartKeyOffsetInfo,
  TraditionalKeyOffsetInfo,
} from './types';
import { drawFallingNote } from './utils';
import * as Tone from 'tone';
import { Note, SmartNote } from '../../types/MidiJSON';
import { getOffsetMapForSmartKeyboard } from '../../utils/calculateSmartKeyboardDimension';
import {
  calculateBlackKeyWidth,
  getOffsetMap,
} from '../../utils/calculateTraditionalKeyboardDimension';

type Props = {
  waterfallDimension: Dimensions;
  startTime: number;
  lookAheadTime: number;
} & (
  | {
      keyboardDimension: SmartKeyboardDimension;
      notes: SmartNote[];
      isSmart: true;
    }
  | {
      keyboardDimension: TraditionalKeyboardDimension;
      notes: Note[];
      isSmart: false;
    }
);

const useStyles = makeStyles(theme => ({
  canvas: {
    display: 'block',
  },
}));

/*
TODO:
- remove smartnote, use isSmart as prop
- add a function in util to determine the notes that should be used
- pass in normal notes LOL
*/

const Waterfall: React.FC<Props> = props => {
  const classes = useStyles();
  const { startTime, lookAheadTime, waterfallDimension } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef(0);
  const prevFrameTime = useRef(Tone.now());
  const firstHiddenNoteIndex = useRef(0);
  const fallingNotes = useRef<Array<FallingNote>>([]);

  const keyOffsetInfo: KeyOffsetInfo = useMemo(() => {
    if (props.isSmart) {
      return {
        isSmart: props.isSmart,
        leftMarginMap: getOffsetMapForSmartKeyboard(props.keyboardDimension),
        keyWidth: props.keyboardDimension.keyWidth,
      };
    } else {
      const { keyWidth, start, range } = props.keyboardDimension;
      return {
        isSmart: props.isSmart,
        leftMarginMap: getOffsetMap(start, range, keyWidth),
        whiteKeyWidth: keyWidth,
        blackKeyWidth: calculateBlackKeyWidth(keyWidth),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.keyboardDimension]);

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
      const timestamp = Tone.now();

      // check if we need to add more notes
      while (
        firstHiddenNoteIndex.current < props.notes.length &&
        props.notes[firstHiddenNoteIndex.current].time <= timestamp - startTime
      ) {
        let newNote: FallingNote;
        if (props.isSmart) {
          const note = props.notes[firstHiddenNoteIndex.current];
          newNote = FallingNote.createFromSmartNoteInfo(
            note,
            speed,
            canvas.height,
            keyOffsetInfo as SmartKeyOffsetInfo,
            prevFrameTime.current - startTime
          );
        } else {
          const note = props.notes[firstHiddenNoteIndex.current];
          newNote = FallingNote.createFromNoteInfo(
            note,
            speed,
            canvas.height,
            keyOffsetInfo as TraditionalKeyOffsetInfo,
            prevFrameTime.current - startTime
          );
        }

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
        firstHiddenNoteIndex.current < props.notes.length
      ) {
        prevFrameTime.current = timestamp;
        animationId.current = window.requestAnimationFrame(animate);
      }
    };

    animationId.current = window.requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyOffsetInfo, lookAheadTime, startTime]);

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
  }, [keyOffsetInfo, startAnimation, waterfallDimension]);

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

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.startTime === nextProps.startTime &&
    prevProps.waterfallDimension.width === nextProps.waterfallDimension.width &&
    prevProps.waterfallDimension.height === nextProps.waterfallDimension.height
  );
}

export default React.memo(Waterfall, areEqual);
