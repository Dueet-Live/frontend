import React from 'react';
import { makeStyles } from '@material-ui/core';
import '../InteractivePiano.css';
import ChevronLeftIcon from '../../icons/ChevronRightIcon';
import ChevronRightIcon from '../../icons/ChevronLeftIcon';

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
  const Icon = icons[type];

  return (
    <button
      className={`interactive-piano__octave-shift-key`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={classes.icon} />
    </button>
  );
};

export default OctaveShiftKey;
