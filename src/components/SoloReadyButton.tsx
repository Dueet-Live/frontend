import { ButtonProps } from '@material-ui/core';
import React from 'react';
import ReadyButton from './shared/ReadyButton';

type Props = ButtonProps & {
  handleStart: () => void;
  isPieceDownloaded: boolean;
};

const SoloReadyButton: React.FC<Props> = ({
  handleStart,
  isPieceDownloaded,
  ...props
}) => {
  return (
    <ReadyButton
      handleReady={handleStart}
      disabled={!isPieceDownloaded}
      {...props}
    >
      Start
    </ReadyButton>
  );
};

export default SoloReadyButton;
