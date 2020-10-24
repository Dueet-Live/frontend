import { ButtonProps } from '@material-ui/core';
import React from 'react';
import ReadyButton from '../shared/ReadyButton';

type Props = ButtonProps & {
  handleStart: () => void;
};

const SoloReadyButton: React.FC<Props> = ({
  handleStart,
  children,
  ...props
}) => {
  return (
    <ReadyButton handleReady={handleStart} {...props}>
      {children}
    </ReadyButton>
  );
};

export default SoloReadyButton;
