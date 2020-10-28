import { useTheme, useMediaQuery } from '@material-ui/core';
import React, { useMemo } from 'react';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Track } from '../../types/MidiJSON';
import { calculateTraditionalKeyHeight } from '../../utils/calculateTraditionalKeyboardDimension';
import { getTraditionalKeyboardMappingWithSpecificStart } from '../../utils/getKeyboardShorcutsMapping';
import useWindowDimensions from '../../utils/useWindowDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import TraditionalPiano from '../Piano/TraditionalPiano/TraditionalPiano';

type Props = {
  instrumentPlayer: InstrumentPlayer;
  keyboardVolume: number;
  keyboardDimension: TraditionalKeyboardDimension;
  playerTrack: Track;
  didPlayNote: (key: number, playerId: number) => void;
  didStopNote: (key: number, playerId: number) => void;
};

const GameTraditionalPiano: React.FC<Props> = ({
  instrumentPlayer, // Unchanged
  keyboardDimension,
  playerTrack, // Unchanged
  didStopNote, // Unchanged
  didPlayNote, // Unchanged
}) => {
  const { height } = useWindowDimensions();
  const keyHeight = useMemo(() => calculateTraditionalKeyHeight(height), [
    height,
  ]);

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = useMemo(() => {
    if (!isDesktopView) {
      return undefined;
    }
    const regularStartNote = playerTrack.regularStartNote || 72;
    getTraditionalKeyboardMappingWithSpecificStart(
      regularStartNote,
      keyboardDimension as TraditionalKeyboardDimension
    );
  }, [keyboardDimension, playerTrack.regularStartNote, isDesktopView]);

  return (
    <TraditionalPiano
      instrumentPlayer={instrumentPlayer}
      includeOctaveShift={false}
      keyboardDimension={keyboardDimension as TraditionalKeyboardDimension}
      keyHeight={keyHeight}
      keyboardMap={keyboardMap}
      didPlayNote={didPlayNote}
      didStopNote={didStopNote}
    />
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyboardDimension.keyWidth ===
    nextProps.keyboardDimension.keyWidth
  );
}

export default React.memo(GameTraditionalPiano, areEqual);
