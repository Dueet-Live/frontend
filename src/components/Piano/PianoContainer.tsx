import React from 'react';
import '../InteractivePiano.css';

type Props = {
  children: React.ReactNode;
};

const PianoContainer: React.FC<Props> = ({ children }) => {
  return (
    <div
      className={'interactive-piano__piano-container'}
      onMouseDown={event => event.preventDefault()}
    >
      {children}
    </div>
  );
};

export default PianoContainer;
