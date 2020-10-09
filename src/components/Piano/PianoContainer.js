import React from 'react';
import '../InteractivePiano.css';

const PianoContainer = ({ children }) => {
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
