import React, { useState } from 'react';
import Piano from './Piano/Piano';
import PianoContainer from './Piano/PianoContainer';
import OctaveShiftKey from './Piano/OctaveShiftKey';
import './InteractivePiano.css';

type Props = {
  start: number;
  range: number;
  keyWidth: number;
  didPlayNote: (key: number, playerId: number) => void;
  didStopNote: (key: number, playerId: number) => void;
};

const InteractivePiano: React.FC<Props> = ({
  start,
  range,
  keyWidth,
  didPlayNote,
  didStopNote,
}) => {
  const [startNote, setStartNote] = useState(start);
  const endNote = startNote + range - 1;

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
        icon={'<'}
        onClick={shiftDownOctave}
        disabled={startNote === lowestMidiNote}
      />
      <Piano
        startNote={startNote}
        endNote={endNote}
        keyWidth={keyWidth}
        keyboardMap={keyboardMap}
        didPlayNote={didPlayNote}
        didStopNote={didStopNote}
      />
      <OctaveShiftKey
        icon={'>'}
        onClick={shiftUpOctave}
        disabled={endNote === highestMidiNote}
      />
    </PianoContainer>
  );
};

export default InteractivePiano;
