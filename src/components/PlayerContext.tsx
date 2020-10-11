import React from 'react';

type PlayerContextProps = {
  me: number;
  friend: number | null;
};

export const PlayerContext = React.createContext<PlayerContextProps>({
  me: -1,
  friend: null,
});
