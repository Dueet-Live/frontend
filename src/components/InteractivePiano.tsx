import React, { useState } from 'react';
import Piano from './Piano/Piano';
import PianoContainer from './Piano/PianoContainer';
import OctaveShiftKey from './Piano/OctaveShiftKey';
import getKeyboardShortcutsMapping from '../utils/getKeyboardShorcutsMapping';
import './InteractivePiano.css';
import { useTheme, useMediaQuery } from '@material-ui/core';

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

  const lowestMidiNote = 21;
  const highestMidiNote = 108;

  const shiftDownOctave = () => {
    let newStartNote = Math.max(startNote - 12, lowestMidiNote);
    if (newStartNote !== lowestMidiNote && newStartNote % 12 !== 0) {
      newStartNote -= newStartNote % 12;
    }
    setStartNote(newStartNote);
  };

  const shiftUpOctave = () => {
    let newEndNote = Math.min(endNote + 12, highestMidiNote);
    if (newEndNote !== highestMidiNote && newEndNote % 12 !== 11) {
      newEndNote -= (newEndNote % 12) + 1;
    }
    const diff = newEndNote - endNote;
    setStartNote(startNote + diff);
  };

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = getKeyboardShortcutsMapping(startNote, range);

  return (
    <PianoContainer>
      <OctaveShiftKey
        type="left"
        onClick={shiftDownOctave}
        disabled={startNote === lowestMidiNote}
      />
      <Piano
        startNote={startNote}
        endNote={endNote}
        keyWidth={keyWidth}
        keyboardMap={isDesktopView ? keyboardMap : {}}
        didPlayNote={didPlayNote}
        didStopNote={didStopNote}
      />
      <OctaveShiftKey
        type="right"
        onClick={shiftUpOctave}
        disabled={endNote === highestMidiNote}
      />
    </PianoContainer>
  );
};

export default InteractivePiano;
