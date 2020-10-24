import React from 'react';

type PianoContextProps = {
  volume: number;
};

export const PianoContext = React.createContext<PianoContextProps>({
  volume: 1,
});
