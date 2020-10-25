import { makeStyles } from '@material-ui/core';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles(theme => ({
  root: {
    display: "inline-flex",
    boxSizing: "border-box",
    position: "relative",
    margin: 0,
    touchAction: "none",
    userSelect: "none",
  }
}));

const PianoContainer: React.FC<Props> = ({ children }) => {
  const classes = useStyles();

  return (
    <div
      className={classes.root}
      onMouseDown={event => event.preventDefault()}
    >
      {children}
    </div>
  );
};

export default PianoContainer;
