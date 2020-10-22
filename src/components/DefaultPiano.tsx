import React from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import {
  calculateDefaultPianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';

const DefaultPiano: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const keyboardDimension = calculateDefaultPianoDimension(width);
  const keyHeight = calculateKeyHeight(height);

  return (
    <InteractivePiano
      includeOctaveShift={true}
      {...keyboardDimension}
      keyHeight={keyHeight}
      didPlayNote={noOp}
      didStopNote={noOp}
    />
  );
};

export default DefaultPiano;
