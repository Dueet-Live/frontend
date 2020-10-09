import React from 'react';
import { Link } from 'react-router-dom';
import InteractivePiano from '../components/InteractivePiano';
import useWindowDimensions from '../utils/useWindowDimensions';

const Solo: React.FC = () => {
  const { width } = useWindowDimensions();
  // TODO: fixed or responsive
  const keyWidth = 50;
  const range = width / keyWidth;

  return (
    <>
      <h3>Solo</h3>
      <Link to="/">
        <button>Back</button>
      </Link>
      <div>
          <InteractivePiano
            start={60 - Math.floor(range / 2)}
            range={range}
            keyWidth={50}
          />
      </div>
    </>
  );
};

export default Solo;