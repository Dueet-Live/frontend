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
};

const InteractivePiano: React.FC<Props> = ({ start, range, keyWidth }) => {
  const [startNote, setStartNote] = useState(start);
  const endNote = startNote + range;

  // TODO: update with octave shift
  const keyboardMap = {
    Q: 'C4',
    2: 'C#4',
    W: 'D4',
    3: 'D#4',
    E: 'E4',
    R: 'F4',
    5: 'F#4',
    T: 'G4',
    6: 'G#4',
    Y: 'A4',
    7: 'A#4',
    U: 'B4',
    V: 'C5',
    G: 'C#5',
    B: 'D5',
    H: 'D#5',
    N: 'E5',
    M: 'F5',
    K: 'F#5',
    ',': 'G5',
    L: 'G#5',
    '.': 'A5',
    ';': 'A#5',
    '/': 'B5',
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
        renderPianoKey={PianoKey}
        keyboardMap={keyboardMap}
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
