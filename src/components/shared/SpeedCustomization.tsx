import { Slider } from '@material-ui/core';
import React from 'react';

type Props = {
  speed: number;
  setSpeed: (speed: number) => void;
};

const marks = [
  {
    value: 0.5,
    label: '0.5',
  },
  {
    value: 0.75,
    label: '0.75',
  },
  {
    value: 1.0,
    label: '1.0',
  },
  {
    value: 1.25,
    label: '1.25',
  },
  {
    value: 1.5,
    label: '1.5',
  },
];

const SpeedCustomization: React.FC<Props> = ({ speed, setSpeed }) => {
  return (
    <Slider
      step={0.25}
      min={0.5}
      max={1.5}
      value={speed}
      valueLabelDisplay="off"
      marks={marks}
      onChange={(e, value: number | number[]) => {
        if (speed !== value) {
          setSpeed(value as number);
        }
      }}
    />
  );
};

export default SpeedCustomization;
