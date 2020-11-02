import { Box, BoxProps, Slider, Typography } from '@material-ui/core';
import React from 'react';
import useSharedLobbyStyles from './LobbySharedStyles';

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

type Props = BoxProps & {
  speed: number;
  setSpeed: (speed: number) => void;
};

const SpeedCustomization: React.FC<Props> = ({
  speed,
  setSpeed,
  ...boxProps
}) => {
  const sharedLobbyStyles = useSharedLobbyStyles();
  return (
    <Box display="flex" justifyContent="space-between" {...boxProps}>
      <Box flex="0 0 30%" display="flex" alignItems="center">
        <Typography variant="body1" className={sharedLobbyStyles.optionLabel}>
          Speed
        </Typography>
      </Box>
      <Box flexGrow={2} px={2} display="flex" alignItems="center">
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
      </Box>
    </Box>
  );
};

export default SpeedCustomization;
