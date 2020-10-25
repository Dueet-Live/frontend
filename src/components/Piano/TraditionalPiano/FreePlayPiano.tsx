import React from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import {
  calculateDefaultPianoDimension,
  calculateKeyHeight,
} from '../../../utils/calculateTraditionalKeyboardDimension';
import useWindowDimensions from '../../../utils/useWindowDimensions';
import TraditionalPiano from './TraditionalPiano';

type Props = {
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
};

const FreePlayPiano: React.FC<Props> = ({
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const { width, height } = useWindowDimensions();
  const keyboardDimension = calculateDefaultPianoDimension(width);
  const keyHeight = calculateKeyHeight(height);

  return (
    <TraditionalPiano
      includeOctaveShift={true}
      keyboardDimension={keyboardDimension}
      keyHeight={keyHeight}
      didPlayNote={handleNotePlay}
      didStopNote={handleNoteStop}
    />
  );
};

export default FreePlayPiano;
