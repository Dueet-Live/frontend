import { Grid, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    alignItems: 'stretch',
  },
  heading: {
    paddingTop: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
  },
}));

const GameEndView = () => {
  const classes = useStyles();

  return (
    <Grid container direction="column" className={classes.root}>
      <Typography
        variant="h1"
        color="primary"
        align="center"
        className={classes.heading}
      >
        Good Job!
      </Typography>
      <Grid item container className={classes.content}></Grid>
    </Grid>
  );
};

export default GameEndView;
