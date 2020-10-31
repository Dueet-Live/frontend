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
      variant="contained"
      color="primary"
      size="large"
      style={{ width: '150px' }}
      onClick={handleReady}
      {...props}
    />
  );
};

export default ReadyButton;
