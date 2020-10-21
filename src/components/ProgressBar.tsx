import React, { useEffect, useState } from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import LinearProgress, {
  LinearProgressProps,
} from '@material-ui/core/LinearProgress';
import { Box, Typography } from '@material-ui/core';

type Props = LinearProgressProps & {
  duration: number;
  started: boolean;
};

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 5,
      height: 10,
    },
    colorPrimary: {
      backgroundColor: '#7B66FC99',
    },
    bar: {
      backgroundColor: theme.palette.primary.main,
      borderRadius: 5,
    },
  })
)(LinearProgress);

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  progressBar: {
    maxWidth: 200,
    flexGrow: 1,
    marginRight: theme.spacing(1),
  },
  label: {
    minWidth: 35,
  },
}));

const ProgressBar: React.FC<Props> = ({ duration, started }) => {
  const classes = useStyles();
  const [currentTime, setCurrentTime] = useState(0);
  const value = (currentTime / duration) * 100;

  useEffect(() => {
    if (!started) {
      return;
    }

    // Schedule timer
    setCurrentTime(10);
  }, [started]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(1, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.progressBar}>
        <BorderLinearProgress variant="determinate" value={value} />
      </Box>
      <Box className={classes.label}>
        <Typography variant="body2" color="textSecondary">
          {`${formatTime(currentTime)}/${formatTime(duration)}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressBar;
