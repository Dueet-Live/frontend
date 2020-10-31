import React, { useMemo, useRef } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { GameContext } from '../../../contexts/GameContext';
import {
  calculateTraditionalKeyboardDimensionForFreePlay,
  calculateTraditionalKeyHeight,
} from '../../../utils/calculateTraditionalKeyboardDimension';
import useWindowDimensions from '../../../utils/useWindowDimensions';
import GameManager from '../../Game/Logic/GameManager';
import InstrumentPlayer from '../InstrumentPlayer';
import TraditionalPiano from './TraditionalPiano';

type Props = {
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
};

const FreePlayPiano: React.FC<Props> = ({
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const { width, height } = useWindowDimensions();
  const keyboardDimension = calculateTraditionalKeyboardDimensionForFreePlay(
    width
  );
  const keyHeight = calculateTraditionalKeyHeight(height);
  const instrumentPlayer = useMemo(
    () => {
      const instrument = new InstrumentPlayer();
      instrument.setInstrument('acoustic_grand_piano');
      return instrument;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const gameManagerRef = useRef<GameManager>(
    new GameManager(handleNotePlay, handleNoteStop)
  );

  return (
    <GameContext.Provider value={{ gameManagerRef, instrumentPlayer }}>
      <TraditionalPiano
        includeOctaveShift={true}
        keyboardDimension={keyboardDimension}
        keyHeight={keyHeight}
      />
    </GameContext.Provider>
  );
};

export default FreePlayPiano;
