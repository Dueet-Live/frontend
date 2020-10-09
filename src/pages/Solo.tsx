import React from 'react';
import { Link } from 'react-router-dom';
import InteractivePiano from '../components/InteractivePiano';
import useWindowDimensions from '../utils/useWindowDimensions';
import {
  calculateKeyboardRange,
  calculateKeyWidth,
  calculateStartNote,
} from '../utils/calculateKeyboardDimension';

const Solo: React.FC = () => {
  const { width } = useWindowDimensions();
  const keyWidth = calculateKeyWidth(width);
  const range = calculateKeyboardRange(width);
  const piano = (
    <InteractivePiano
      start={calculateStartNote(range)}
      range={range}
      keyWidth={keyWidth}
      handleKeyDown={note => console.log(`Start playing: ${note}`)}
      handleKeyUp={note => console.log(`Stop playing: ${note}`)}
    />
  );

  return (
    <>
      <h3>Solo</h3>
      <Link to="/">
        <button>Back</button>
      </Link>

      {/* TODO: Position the piano */}
      <div>{piano}</div>
    </>
  );
};

export default Solo;
