import { makeStyles, Slider, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    width: 'min(300px, 70%)',
    marginRight: theme.spacing(1),
    padding: 0,
    paddingBottom: theme.spacing(1),
  },
}));

type Props = {
  speed: number;
  setSpeed: (speed: number) => void;
};

const SpeedCustomization: React.FC<Props> = ({ speed, setSpeed }) => {
  const classes = useStyles();

  return (
    <>
      <Typography>Speed</Typography>
      <Slider
        step={0.25}
        min={0.5}
        max={1.5}
        value={speed}
        valueLabelDisplay="on"
        marks
        onChangeCommitted={(e, value: number | number[]) => {
          setSpeed(value as number);
        }}
        className={classes.root}
      />
    </>
  );
};

export default SpeedCustomization;
