import { Button, ButtonProps, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  button: {
    width: '150px',
    height: '40x',
    fontSize: theme.typography.h6.fontSize,
    [theme.breakpoints.up('md')]: {
      width: '300px',
      height: '80px',
      fontSize: theme.typography.h3.fontSize,
    },
  },
}));

type ReadyButtonProps = ButtonProps & {
  handleReady: () => void;
};

/**
 * Shared by SoloReadyButton and DuetReadyButton
 */
const ReadyButton: React.FC<ReadyButtonProps> = ({ handleReady, ...props }) => {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      className={classes.button}
      onClick={handleReady}
      {...props}
    />
  );
};

export default ReadyButton;
