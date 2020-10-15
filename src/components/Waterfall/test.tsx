import React, { useEffect, useRef, useState } from 'react';
import {
  calculateBlackKeyWidth,
  calculateKeyHeight,
  getOffsetMap,
} from '../../utils/calculateKeyboardDimension';
import useWindowDimensions from '../../utils/useWindowDimensions';
import isAccidentalNote from '../Piano/utils/isAccidentalNote';
import { FallingNote } from './FallingNote';
import { KeyboardDimension, Note, SongInfo } from './types';
import {
  calculateLookAheadTime,
  convertTimeInfoToMilliseconds,
  delayStartTime,
  drawFallingNote,
} from './utils';

const MARGIN = 2; // TODO: remove?

export const Waterfall = ({
  start,
  range,
  keyWidth,
  bpm,
  beatsPerBar,
  smallStartNote,
  regularStartNote,
  notes,
}: SongInfo & KeyboardDimension) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notesInMs = useRef<Array<Note>>(convertTimeInfoToMilliseconds(notes));
  const prevFrameTime = useRef(0);
  const isPaused = useRef(true);
  const firstHiddenNoteIndex = useRef(0);
  const fallingNotes = useRef<Array<FallingNote>>([]);
  // TODO: remove these
  const { width, height } = useWindowDimensions();
  const waterfallHeight = height - calculateKeyHeight(height);

  const lookAheadTime = calculateLookAheadTime(bpm, beatsPerBar);
  const offsetMap = getOffsetMap(start, range, keyWidth);

  const startAnimation = (): void => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }

    notesInMs.current = delayStartTime(notesInMs.current, lookAheadTime);
    const speed = canvasRef.current!.height / lookAheadTime;

    const animate = (timestamp: number) => {
      if (isPaused.current) {
        notesInMs.current = delayStartTime(notesInMs.current, lookAheadTime);
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
        // TODO: refactor into FallingNote
        const fallingNoteLen = note.duration * speed;
        const horizontalPos = offsetMap[note.midi] + MARGIN;
        const width =
          (isAccidentalNote(note.midi)
            ? calculateBlackKeyWidth(keyWidth)
            : keyWidth) -
          MARGIN * 2;
        fallingNotes.current.push(
          new FallingNote(horizontalPos, width, fallingNoteLen, -fallingNoteLen)
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
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    startAnimation();
  });

  return (
    <canvas ref={canvasRef} width={width} height={waterfallHeight}>
      Unable to render the required visuals on this browser ): Perhaps, switch
      to another browser?
    </canvas>
  );
};
