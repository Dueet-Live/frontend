import React from 'react';
import InteractivePiano from '../components/InteractivePiano';
import RoomHeader from '../components/RoomHeader';
import {
  calculateDefaultPianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import useWindowDimensions from '../utils/useWindowDimensions';

const Solo: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const keyboardDimension = calculateDefaultPianoDimension(width);
  const keyHeight = calculateKeyHeight(height);
  const piano = (
    <InteractivePiano
      includeOctaveShift
      {...keyboardDimension}
      keyHeight={keyHeight}
      didPlayNote={(note, playerId) => {
        // console.log(`Start playing: ${note} by ${playerId}`);
      }}
      didStopNote={(note, playerId) => {
        // console.log(`Stop playing: ${note} by ${playerId}`);
      }}
    />
  );

  return (
    <>
      <RoomHeader isSolo />

      {/* TODO: Position the piano */}
      <div>{piano}</div>
    </>
  );
};

export default Solo;
