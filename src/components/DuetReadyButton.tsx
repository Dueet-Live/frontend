import { ButtonProps } from '@material-ui/core';
import React, { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { RoomContext } from '../contexts/RoomContext';
import { getPartsSelection, getReady } from '../utils/roomInfo';
import { updateReady } from '../utils/socket';
import ReadyButton from './shared/ReadyButton';

type Props = ButtonProps & {
  isDownloadingSong: boolean;
};

const DuetReadyButton: React.FC<Props> = ({ isDownloadingSong, ...props }) => {
  const { roomInfo } = useContext(RoomContext);
  const { me, friend } = useContext(PlayerContext);

  const { piece } = roomInfo;

  // room not setup yet
  if (me === -1) return <></>;

  const { primo, secondo } = getPartsSelection(roomInfo);

  const ready = getReady(roomInfo, me);

  const handleReady = (isReady: boolean) => {
    updateReady(isReady);
  };

  const disabled =
    friend === null ||
    piece === undefined ||
    // TODO this condition should be removed when server marks me as not
    // ready when friend leaves.
    ((primo.length === 0 || secondo.length === 0) && !ready.me) ||
    (ready.me && ready.friend) ||
    isDownloadingSong;

  const text = isDownloadingSong ? 'Loading' : ready.me ? 'Not Ready' : 'Ready';

  return (
    <ReadyButton
      handleReady={() => handleReady(!ready.me)}
      disabled={disabled}
      {...props}
    >
      {text}
    </ReadyButton>
  );
};

export default DuetReadyButton;
