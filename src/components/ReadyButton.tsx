import { Button, ButtonProps } from '@material-ui/core';
import React, { useContext } from 'react';
import { getPartsSelection, getReady } from '../utils/roomInfo';
import { updateReady } from '../utils/socket';
import { PlayerContext } from './PlayerContext';
import { RoomContext } from './RoomContext';

type Props = ButtonProps & {
  isPieceDownloaded: boolean;
};

const ReadyButton: React.FC<Props> = ({ isPieceDownloaded, ...props }) => {
  const { roomInfo } = useContext(RoomContext);
  const { me, friend } = useContext(PlayerContext);

  const { piece } = roomInfo;

  // room not setup yet
  if (me === -1 || friend === null) return <></>;

  const { primo, secondo } = getPartsSelection(roomInfo);

  const ready = getReady(roomInfo, me);

  const handleReady = (isReady: boolean) => {
    updateReady(isReady);
  };

  // disable ready if
  const disabled =
    friend === null ||
    piece === undefined ||
    (primo.length === 0 && !ready.me) ||
    (secondo.length === 0 && !ready.me) ||
    (ready.me && ready.friend) ||
    !isPieceDownloaded;

  return (
    <Button
      variant="outlined"
      color="primary"
      style={{ width: '110px' }}
      disabled={disabled}
      onClick={() => handleReady(!ready.me)}
      {...props}
    >
      {ready.me ? 'Not Ready' : 'Ready'}
    </Button>
  );
};

export default ReadyButton;
