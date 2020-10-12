import React, { useEffect } from 'react';
import {
  calculateKeyHeight,
  getOffsetMap,
} from '../../utils/calculateKeyboardDimension';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { KeyboardDimension, SongInfo } from './types';
import {
  delayStartTime,
  calculateLookAheadTime,
  convertTimeInfoToMilliseconds,
  startAnimation,
} from './utils';

const CANVAS_ID = 'waterfall-canvas';

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
  const { width, height } = useWindowDimensions();
  const waterfallHeight = height - calculateKeyHeight(height);

  const offsetMap = getOffsetMap(start, range, keyWidth);
  console.log(offsetMap);
  useEffect(() => {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
    const ctx = !canvas.getContext
      ? null
      : (canvas.getContext('2d') as CanvasRenderingContext2D);
    if (ctx === null) {
      return;
    }

    convertTimeInfoToMilliseconds(notes);
    const lookAheadTime = calculateLookAheadTime(bpm, beatsPerBar);
    const speed = canvas.height / lookAheadTime;
    delayStartTime(notes, lookAheadTime);

    startAnimation(
      ctx,
      canvas.height,
      canvas.width,
      speed,
      lookAheadTime,
      notes,
      offsetMap,
      keyWidth
    );
  }, [bpm, beatsPerBar, notes, offsetMap, keyWidth]);

  return (
    <canvas id={CANVAS_ID} width={width} height={waterfallHeight}>
      Unable to render the required visuals on this browser ): Perhaps, switch
      to another browser?
    </canvas>
  );
};
