import { Button, ButtonProps } from '@material-ui/core';
import React, { useContext } from 'react';
import { updateReady } from '../utils/socket';
import { PlayerContext } from './PlayerContext';
import { RoomContext } from './RoomContext';

const ReadyButton: React.FC<ButtonProps> = props => {
  const {
    roomInfo: { players, piece },
  } = useContext(RoomContext);
  const { me, friend } = useContext(PlayerContext);

  // room is not set up yet. do not show
  if (me === -1 || friend === null || piece === undefined) return <></>;

  const isReady = players.find(player => player.id === me)!.ready;
  const friendReady = players.find(player => player.id === friend)!.ready;

  const handleReady = (isReady: boolean) => {
    updateReady(isReady);
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      style={{ width: '110px' }}
      disabled={isReady && friendReady}
      onClick={() => handleReady(!isReady)}
      {...props}
    >
      {isReady ? 'Not Ready' : 'Ready'}
    </Button>
  );
};

export default ReadyButton;
