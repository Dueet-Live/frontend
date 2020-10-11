import React from 'react';
import { makeStyles } from '@material-ui/core';
import '../InteractivePiano.css';
import ChevronLeftIcon from '../../icons/ChevronRightIcon';
import ChevronRightIcon from '../../icons/ChevronLeftIcon';
import { calculateKeyHeight } from '../../utils/calculateKeyboardDimension';
import useWindowDimensions from '../../utils/useWindowDimensions';

type Props = {
  type: string;
  onClick: () => void;
  disabled: boolean;
};

const icons: { [type: string]: React.FC<any> } = {
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
};

const useStyles = makeStyles(theme => ({
  icon: {
    fill: theme.palette.primary.main,
  },
}));

const OctaveShiftKey: React.FC<Props> = ({ type, onClick, disabled }) => {
  const classes = useStyles();
  const { height } = useWindowDimensions();
  const keyHeight = calculateKeyHeight(height);
  const Icon = icons[type];

  return (
    <button
      className={`interactive-piano__octave-shift-key`}
      style={{ height: keyHeight }}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={classes.icon} />
    </button>
  );
};

export default OctaveShiftKey;
