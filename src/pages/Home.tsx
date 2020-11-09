import {
  Button,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';
import EqualizerIcon from '../icons/EqualizerIcon';

const useStyles = makeStyles(theme => ({
  outer: {
    height: '100%',
  },
  inner: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  subtext: {
    maxWidth: '75%',
  },
  button: {
    width: '148px',
  },
  icon: {
    fontSize: theme.typography.h3.fontSize,
  },
  help: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
}));

const Home: React.FC<{
  setShowTutorial: (show: React.SetStateAction<boolean>) => void;
}> = ({ setShowTutorial }) => {
  const history = useHistory();
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="center"
        className={classes.outer}
      >
        <Grid
          item
          container
          xs={12}
          spacing={2}
          className={classes.inner}
          justify="center"
        >
          <Grid
            item
            container
            xs={12}
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h3" color="primary">
                Dueet Live
              </Typography>
            </Grid>
            <Grid item>
              <EqualizerIcon className={classes.icon} />
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.subtext}>
            <Typography variant="body1">
              Welcome to Dueet Live! How would you like to enjoy your musical
              journey today?
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push('/duet');
              }}
              className={classes.button}
            >
              Duet
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push('/solo');
              }}
              className={classes.button}
            >
              Solo
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <IconButton
        className={classes.help}
        color="primary"
        onClick={() => setShowTutorial(true)}
      >
        <HelpOutline />
      </IconButton>
    </>
  );
};

export default Home;
