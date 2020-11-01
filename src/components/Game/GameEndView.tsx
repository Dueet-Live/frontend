import { Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { GameContext } from '../../contexts/GameContext';
import { RoomContext } from '../../contexts/RoomContext';
import CrossIcon from '../../icons/CrossIcon';
import StarIcon from '../../icons/StarIcon';
import ThumbDownIcon from '../../icons/ThumbDownIcon';
import ThumbUpIcon from '../../icons/ThumbUpIcon';
import useSong from '../../utils/useSong';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 1 auto',
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
  progressBarContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '50%',
    margin: theme.spacing(3),
  },
  center: {
    textAlign: 'center',
  },
  portraitContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  stats: {
    marginTop: theme.spacing(1),
  },
}));

const GameEndView = () => {
  const classes = useStyles();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const {
    roomInfo: { piece },
    score,
  } = useContext(RoomContext);

  const landscape = useMediaQuery('(min-width: 450px)');

  const song = useSong(piece);
  const finalAccuracy =
    score.total === 0 ? 0 : (score.correct / score.total) * 100;
  const [accuracy, setAccuracy] = useState(0);

  const { gameManagerRef } = useContext(GameContext);
  const feedbackManager = gameManagerRef?.current.feedbackManager;
  const gameStats = feedbackManager?.generateStats();

  useEffect(() => {
    const handler = setTimeout(() => setAccuracy(finalAccuracy), 100);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let text = '';
  let subtext = '';
  if (accuracy > 80) {
    text = 'Amazing!';
    subtext = 'Give our other songs a try too!';
  } else if (accuracy > 50) {
    text = 'Good Job!';
    subtext = 'Give our other songs a try too!';
  } else {
    text = 'Nice try!';
    subtext = 'Maybe try again with a slower speed?';
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        className={`${classes.content} ${
          landscape ? '' : classes.portraitContent
        }`}
      >
        <Grid
          item
          container
          direction="column"
          justify="center"
          xs={landscape ? 6 : 'auto'}
        >
          <Grid item>
            <Typography
              variant="h1"
              color="primary"
              align="center"
              className={classes.title}
            >
              {text}
            </Typography>
            <Typography variant="subtitle1" align="center">
              {subtext}
            </Typography>
          </Grid>
          <Grid item>
            <Typography align="center">
              You just played: {song?.name}
            </Typography>
          </Grid>
          {/* Game statistics */}
          <Grid
            item
            container
            direction="row"
            justify="center"
            spacing={1}
            className={classes.stats}
          >
            <Grid item>
              <StarIcon />
            </Grid>
            <Grid item>
              <Typography>x{gameStats?.perfect}</Typography>
            </Grid>
            <Grid item>
              <ThumbUpIcon />
            </Grid>
            <Grid item>
              <Typography>x{gameStats?.great}</Typography>
            </Grid>
            <Grid item>
              <ThumbDownIcon />
            </Grid>
            <Grid item>
              <Typography>x{gameStats?.bad}</Typography>
            </Grid>
            <Grid item>
              <CrossIcon />
            </Grid>
            <Grid item>
              <Typography>x{gameStats?.miss}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          container
          direction="column"
          justify="center"
          className={classes.center}
          xs={landscape ? 6 : 'auto'}
        >
          <Grid
            item
            container
            direction="column"
            justify="center"
            className={classes.progressBarContainer}
          >
            <CircularProgressbar
              value={accuracy}
              text={`${accuracy.toFixed(0)}%`}
              className={classes.progressBar}
              styles={{
                path: {
                  stroke: primaryColor,
                  transitionDuration: '1s',
                },
                text: {
                  fill: primaryColor,
                },
              }}
            />
            <Typography variant="body1">Playing accuracy</Typography>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default GameEndView;
