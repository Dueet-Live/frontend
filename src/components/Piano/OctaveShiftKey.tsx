import React from 'react';
import './InteractivePiano.css';

type Props = {
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

const OctaveShiftKey: React.FC<Props> = ({ icon, onClick, disabled }) => {
  return (
    <div className={'interactive-piano__octave-shift-key__wrapper'}>
      <button
        className={`interactive-piano__octave-shift-key`}
        onClick={onClick}
        disabled={disabled}
      >
        <div>{icon}</div>
      </button>
    </div>
  );
};

export default OctaveShiftKey;
