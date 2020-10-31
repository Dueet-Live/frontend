import { ButtonProps, makeStyles, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext } from '../../contexts/RoomContext';
import { getParts, getReady } from '../../utils/roomInfo';
import { updateReady } from '../../utils/socket';
import { startAudioContext } from '../../utils/toneContext';
import ReadyButton from '../shared/ReadyButton';

const useStyles = makeStyles(theme => ({
  readyButtonMessage: {
    color: 'red',
  },
  hidden: {
    visibility: 'hidden',
  },
}));

type Props = ButtonProps & {
  isDownloadingSong: boolean;
};

const DuetReadyButton: React.FC<Props> = ({ isDownloadingSong, ...props }) => {
  const classes = useStyles();
  const { roomInfo } = useContext(RoomContext);
  const { me, friend } = useContext(PlayerContext);

  const { piece } = roomInfo;

  // room not setup yet
  if (me === -1) return <></>;

  const parts = getParts(roomInfo, me);
  const ready = getReady(roomInfo, me);

  const handleReady = (isReady: boolean) => {
    updateReady(isReady);
    if (isReady) {
      startAudioContext(); // AudioContext has to be started with a click event
    }
  };

  const disabled = (() => {
    if (ready.me) {
      // If both are ready, cannot 'unready'
      return ready.friend;
    }

    // I am not ready, check if I can be ready
    return (
      friend === null ||
      piece === undefined ||
      parts.me === null ||
      parts.friend === null ||
      parts.me === parts.friend ||
      isDownloadingSong
    );
  })();

  const readyButtonText = isDownloadingSong
    ? 'Loading...'
    : ready.me
    ? 'Not Ready'
    : 'Ready!';

  let message: string | null = null;
  if (friend === null) {
    message = '';
  } else if (piece === undefined) {
    message = 'Please select a piece to play';
  } else if (parts.me === null) {
    message = 'Please select a part to play';
  } else if (parts.friend === null) {
    message = 'Waiting for your partner to pick a part...';
  } else if (parts.me === parts.friend) {
    message = 'Both players must play different parts';
  }

  return (
    <>
      <Typography
        variant="body1"
        noWrap
        className={` ${classes.readyButtonMessage} ${
          message ? '' : classes.hidden
        }`}
      >
        {message || 'PLACEHOLDER'}
      </Typography>
      <ReadyButton
        handleReady={() => handleReady(!ready.me)}
        disabled={disabled}
        {...props}
      >
        {readyButtonText}
      </ReadyButton>
    </>
  );
};

export default DuetReadyButton;
