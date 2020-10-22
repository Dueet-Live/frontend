import { Typography } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { RoomContext } from './RoomContext';

type Props = {
  setIsPlaying: (flag: boolean) => void;
  setTimeToStart: (timeToStart: number) => void;
};

const Countdown: React.FC<Props> = ({ setIsPlaying, setTimeToStart }) => {
  const { timeToStart } = useContext(RoomContext);

  useEffect(() => {
    if (timeToStart <= 0) {
      return;
    }

    const handler = setTimeout(() => {
      if (timeToStart > 0) {
        setTimeToStart(timeToStart - 1);
      }
      if (timeToStart === 1) {
        setIsPlaying(true);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeToStart]);

  return (
    <Typography variant="h1" align="center" color="primary">
      {timeToStart}
    </Typography>
  );
};

export default Countdown;
