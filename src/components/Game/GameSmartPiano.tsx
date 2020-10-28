import { useTheme, useMediaQuery } from '@material-ui/core';
import React, { useMemo } from 'react';
import { calculateSmartKeyHeight } from '../../utils/calculateSmartKeyboardDimension';
import { getSmartKeyboardMapping } from '../../utils/getKeyboardShorcutsMapping';
import useWindowDimensions from '../../utils/useWindowDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import SmartPiano from '../Piano/SmartPiano/SmartPiano';

type Props = {
  instrumentPlayer: InstrumentPlayer;
  keyWidth: number;
  currentMapping: number[];
  didPlayNote: (key: number, playerId: number) => void;
  didStopNote: (key: number, playerId: number) => void;
};

const GameSmartPiano: React.FC<Props> = ({
  instrumentPlayer, // Unchanged
  keyWidth,
  currentMapping,
  didStopNote, // Unchanged
  didPlayNote, // Unchanged
}) => {
  const { height } = useWindowDimensions();
  const keyHeight = useMemo(() => calculateSmartKeyHeight(height), [height]);

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = useMemo(() => {
    if (!isDesktopView) {
      return undefined;
    }

    return getSmartKeyboardMapping();
  }, [isDesktopView]);

  return (
    <SmartPiano
      instrumentPlayer={instrumentPlayer}
      keyHeight={keyHeight}
      keyWidth={keyWidth}
      smartMapping={currentMapping}
      keyboardMap={keyboardMap}
      didPlayNote={didPlayNote}
      didStopNote={didStopNote}
    />
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyWidth === nextProps.keyWidth &&
    prevProps.currentMapping === nextProps.currentMapping
  );
}

export default React.memo(GameSmartPiano, areEqual);
