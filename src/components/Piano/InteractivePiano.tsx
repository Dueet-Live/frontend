import React, { useEffect, useState } from 'react';
import './InteractivePiano.css';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { getKeyboardMapping } from '../../utils/getKeyboardShorcutsMapping';
import OctaveShiftKey from './OctaveShiftKey';
import Piano from './Piano';
import PianoContainer from './PianoContainer';
import { KeyboardDimension } from '../../types/KeyboardDimension';

type Props = {
  includeOctaveShift: boolean;
  keyboardDimension: KeyboardDimension;
  keyHeight: number;
  keyboardMap?: { [key: string]: number };
  didPlayNote?: (key: number, playerId: number) => void;
  didStopNote?: (key: number, playerId: number) => void;
};

const InteractivePiano: React.FC<Props> = ({
  includeOctaveShift = true,
  keyboardDimension,
  keyHeight,
  keyboardMap,
  didPlayNote,
  didStopNote,
}) => {
  const { start, range, keyWidth } = keyboardDimension;
  const [startNote, setStartNote] = useState(start);
  const [keyRange, setKeyRange] = useState(start);
  const endNote = startNote + keyRange - 1;

  const lowestMidiNote = 21;
  const highestMidiNote = 108;

  useEffect(() => {
    setStartNote(start);
    setKeyRange(range);
  }, [start, range]);

  const shiftDownOctave = () => {
    let newStartNote = Math.max(startNote - 12, lowestMidiNote);
    if (newStartNote !== lowestMidiNote && newStartNote % 12 !== 0) {
      newStartNote -= newStartNote % 12;
    }
    setStartNote(newStartNote);
  };

  const shiftUpOctave = () => {
    let newEndNote = Math.min(endNote + 12, highestMidiNote);
    if (newEndNote !== highestMidiNote && newEndNote % 12 !== 0) {
      newEndNote -= newEndNote % 12;
    }
    const diff = newEndNote - endNote;
    setStartNote(startNote + diff);
  };

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const defaultKeyboardMap = isDesktopView
    ? getKeyboardMapping(startNote, range)
    : {};

  return (
    <PianoContainer>
      {includeOctaveShift && (
        <OctaveShiftKey
          type="left"
          keyHeight={keyHeight}
          onClick={shiftDownOctave}
          disabled={startNote === lowestMidiNote}
        />
      )}

      <Piano
        startNote={startNote}
        endNote={endNote}
        keyWidth={keyWidth}
        keyHeight={keyHeight}
        keyboardMap={keyboardMap ? keyboardMap : defaultKeyboardMap}
        didPlayNote={didPlayNote}
        didStopNote={didStopNote}
      />
      {includeOctaveShift && (
        <OctaveShiftKey
          type="right"
          keyHeight={keyHeight}
          onClick={shiftUpOctave}
          disabled={endNote === highestMidiNote}
        />
      )}
    </PianoContainer>
  );
};

export default InteractivePiano;
