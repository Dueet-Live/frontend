import { AppBar, makeStyles, Toolbar, ToolbarProps } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#FFF',
  },
  toolBar: {
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      minHeight: 36,
      height: 36,
    },
  },
}));

const RoomHeader: React.FC<ToolbarProps> = ({ children, ...props }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar {...props} className={classes.toolBar}>
          {children}
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolBar} /> {/* To take up space */}
    </div>
  );
};

export default RoomHeader;
