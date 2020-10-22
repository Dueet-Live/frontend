import { Button, ButtonProps } from '@material-ui/core';
import React from 'react';

type ReadyButtonProps = ButtonProps & {
  handleReady: () => void;
};

/**
 * Shared by SoloReadyButton and DuetReadyButton
 */
const ReadyButton: React.FC<ReadyButtonProps> = ({ handleReady, ...props }) => {
  return (
    <Button
      variant="outlined"
      color="primary"
      style={{ width: '110px' }}
      onClick={handleReady}
      {...props}
    />
  );
};

export default ReadyButton;
