import React from 'react';
import InteractivePiano from '../components/InteractivePiano';
import RoomHeader from '../components/RoomHeader';
import {
  calculateKeyboardRange,
  calculateKeyWidth,
  calculateStartNote,
} from '../utils/calculateKeyboardDimension';
import useWindowDimensions from '../utils/useWindowDimensions';

const Solo: React.FC = () => {
  const { width } = useWindowDimensions();
  const keyWidth = calculateKeyWidth(width);
  const range = calculateKeyboardRange(width);
  const piano = (
    <InteractivePiano
      start={calculateStartNote(range)}
      range={range}
      keyWidth={keyWidth}
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
