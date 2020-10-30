import { useTheme, useMediaQuery } from '@material-ui/core';
import React, { useMemo } from 'react';
import { Note } from '../../types/MidiJSON';
import { calculateSmartKeyHeight } from '../../utils/calculateSmartKeyboardDimension';
import { getSmartKeyboardMapping } from '../../utils/getKeyboardShorcutsMapping';
import useWindowDimensions from '../../utils/useWindowDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import SmartPiano from '../Piano/SmartPiano/SmartPiano';
import { MappedNote } from '../Piano/types/mappedNote';
import { getIndexToNotesMap } from '../Piano/utils/getKeyToNotesMap';
import GameManager from './Logic/GameManager';

type Props = {
  gameManagerRef: React.MutableRefObject<GameManager>;
  instrumentPlayer: InstrumentPlayer;
  keyWidth: number;
  normalPlayerNotes: Note[];
  startTime: number;
  didPlayNote: (key: number, playerId: number) => void;
  didStopNote: (key: number, playerId: number) => void;
};

const GameSmartPiano: React.FC<Props> = props => {
  const { normalPlayerNotes, ...pianoProps } = props;
  const indexToNotesMap: MappedNote[][] = useMemo(
    () => getIndexToNotesMap(normalPlayerNotes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
      keyHeight={keyHeight}
      indexToNotesMap={indexToNotesMap}
      keyboardMap={keyboardMap}
      {...pianoProps}
    />
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyWidth === nextProps.keyWidth &&
    prevProps.startTime === nextProps.startTime
  );
}

export default React.memo(GameSmartPiano, areEqual);
