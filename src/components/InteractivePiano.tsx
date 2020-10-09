import React, { useState } from 'react';
import Piano from './Piano/Piano';
import PianoContainer from './Piano/PianoContainer';
import PianoKey from './Piano/PianoKey';
import OctaveShiftKey from './Piano/OctaveShiftKey';
import './InteractivePiano.css';

type Props = {
  start: number;
  range: number;
  keyWidth: number;
  handleKeyDown: (key: number) => void;
  handleKeyUp: (key: number) => void;
};

const InteractivePiano: React.FC<Props> = ({
  start,
  range,
  keyWidth,
  handleKeyDown,
  handleKeyUp,
}) => {
  const [startNote, setStartNote] = useState(start);
  const endNote = startNote + range;

  // TODO: update with octave shift
  const keyboardMap = {
    Q: 60,
    2: 61,
    W: 62,
    3: 63,
    E: 64,
    R: 65,
    5: 66,
    T: 67,
    6: 68,
    Y: 69,
    7: 70,
    U: 71,
    V: 72,
    G: 73,
    B: 74,
    H: 75,
    N: 76,
    M: 77,
    K: 78,
    ',': 79,
    L: 80,
    '.': 81,
    ';': 82,
    '/': 83,
  };

  const lowestMidiNote = 21;
  const highestMidiNote = 108;

  const shiftDownOctave = () => {
    const newStartNote = Math.max(startNote - 12, lowestMidiNote);
    setStartNote(newStartNote);
  };

  const shiftUpOctave = () => {
    const newEndNote = Math.min(endNote + 12, highestMidiNote);
    const diff = newEndNote - endNote;
    setStartNote(startNote + diff);
  };

  return (
    <PianoContainer>
      <OctaveShiftKey
        icon={'l'}
        onClick={shiftDownOctave}
        disabled={startNote === lowestMidiNote}
      />
      <Piano
        startNote={startNote}
        endNote={endNote}
        keyWidth={keyWidth}
        renderPianoKey={PianoKey}
        keyboardMap={keyboardMap}
        handleKeyDown={handleKeyDown}
        handleKeyUp={handleKeyUp}
      />
      <OctaveShiftKey
        icon={'r'}
        onClick={shiftUpOctave}
        disabled={endNote === highestMidiNote}
      />
    </PianoContainer>
  );
};

export default InteractivePiano;
