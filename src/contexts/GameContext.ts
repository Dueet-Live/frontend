import React from 'react';
import GameManager from '../components/Game/Logic/GameManager';
import InstrumentPlayer from '../components/Piano/InstrumentPlayer';

type GameContextProps = {
  gameManagerRef?: React.MutableRefObject<GameManager>;
  instrumentPlayer: InstrumentPlayer;
};

export const GameContext = React.createContext<GameContextProps>({
  instrumentPlayer: new InstrumentPlayer(),
});
