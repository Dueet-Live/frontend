import { useTheme } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar';
import * as Tone from 'tone';

type Props = {
  startTime: number;
  delayedStartTime: number;
  songDuration: number;
};

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative!important' as any,
    zIndex: '1!important' as any,
    flexGrow: 0,
  },
}));

const ProgressBar: React.FC<Props> = ({
  startTime,
  delayedStartTime,
  songDuration,
}) => {
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const classes = useStyles();

  useEffect(() => {
    if (startTime === -1) {
      return;
    }

    const handler = setInterval(() => {
      const timeElapsed = Tone.now() - delayedStartTime;
      if (timeElapsed <= 0) {
        return;
      }
      const currentProgress = (timeElapsed / songDuration) * 100;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(handler);
        return;
      }
      setProgress(currentProgress);
    }, 100);

    return () => {
      clearInterval(handler);
    };
  }, [startTime, delayedStartTime, songDuration]);

  return (
    <LoadingBar
      color={theme.palette.primary.main}
      className={classes.root}
      progress={progress}
    />
  );
};

export default ProgressBar;
