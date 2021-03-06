import React, { useEffect, useState } from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { getTraditionalKeyboardMapping } from '../../../utils/getKeyboardShorcutsMapping';
import OctaveShiftKey from './OctaveShiftKey';
import TraditionalKeyboard from './TraditionalKeyboard';
import TraditionalPianoContainer from './TraditionalPianoContainer';
import { TraditionalKeyboardDimension } from '../../../types/keyboardDimension';

type Props = {
  includeOctaveShift: boolean;
  keyboardDimension: TraditionalKeyboardDimension;
  keyHeight: number;
  keyboardMap?: { [key: string]: number };
};

const TraditionalPiano: React.FC<Props> = ({
  includeOctaveShift = true, // Unchanged
  keyboardDimension,
  keyHeight,
  keyboardMap,
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
    ? getTraditionalKeyboardMapping(startNote, range)
    : {};

  return (
    <TraditionalPianoContainer>
      {includeOctaveShift && (
        <OctaveShiftKey
          type="left"
          keyHeight={keyHeight}
          onClick={shiftDownOctave}
          disabled={startNote === lowestMidiNote}
        />
      )}

      <TraditionalKeyboard
        startNote={startNote}
        endNote={endNote}
        keyWidth={keyWidth}
        keyHeight={keyHeight}
        keyboardMap={keyboardMap ? keyboardMap : defaultKeyboardMap}
      />
      {includeOctaveShift && (
        <OctaveShiftKey
          type="right"
          keyHeight={keyHeight}
          onClick={shiftUpOctave}
          disabled={endNote === highestMidiNote}
        />
      )}
    </TraditionalPianoContainer>
  );
};

export default TraditionalPiano;
