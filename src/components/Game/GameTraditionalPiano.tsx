import { useTheme, useMediaQuery } from '@material-ui/core';
import React, { useMemo } from 'react';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Track } from '../../types/MidiJSON';
import { calculateTraditionalKeyHeight } from '../../utils/calculateTraditionalKeyboardDimension';
import { getTraditionalKeyboardMappingWithSpecificStart } from '../../utils/getKeyboardShorcutsMapping';
import useWindowDimensions from '../../utils/useWindowDimensions';
import TraditionalPiano from '../Piano/TraditionalPiano/TraditionalPiano';

type Props = {
  keyboardVolume: number;
  keyboardDimension: TraditionalKeyboardDimension;
  playerTrack: Track;
};

const GameTraditionalPiano: React.FC<Props> = props => {
  const { playerTrack, keyboardDimension, ...pianoProps } = props;
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
      includeOctaveShift={false}
      keyHeight={keyHeight}
      keyboardMap={keyboardMap}
      keyboardDimension={keyboardDimension}
      {...pianoProps}
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
