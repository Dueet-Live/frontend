import { AppBar, makeStyles, Toolbar, ToolbarProps } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#FFF',
  },
});

const RoomHeader: React.FC<ToolbarProps> = ({ children, ...props }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar {...props}>{children}</Toolbar>
      </AppBar>
      <Toolbar /> {/* To take up space */}
    </div>
  );
};

export default RoomHeader;
