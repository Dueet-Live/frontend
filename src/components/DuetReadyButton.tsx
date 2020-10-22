import { ButtonProps } from '@material-ui/core';
import React, { useContext } from 'react';
import { getPartsSelection, getReady } from '../utils/roomInfo';
import { updateReady } from '../utils/socket';
import { PlayerContext } from '../contexts/PlayerContext';
import { RoomContext } from '../contexts/RoomContext';
import ReadyButton from './shared/ReadyButton';

type Props = ButtonProps & {
  isPieceDownloaded: boolean;
};

const DuetReadyButton: React.FC<Props> = ({ isPieceDownloaded, ...props }) => {
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
    <ReadyButton
      handleReady={() => handleReady(!ready.me)}
      disabled={disabled}
      {...props}
    >
      {ready.me ? 'Not Ready' : 'Ready'}
    </ReadyButton>
  );
};

export default DuetReadyButton;
