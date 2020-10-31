import { Button, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Part } from '../../types/messages';

const useStyles = makeStyles(theme => ({
  pill: {
    borderRadius: '9999px',
    textAlign: 'center',
    background: '#FC7B66',
    color: 'white',
    height: '2rem',
    width: '40%',
    '&:disabled': {
      background: '#FEB3A5',
    },
  },
}));

type Props = {
  part: Part;
  selected?: boolean;
  onClick: () => void;
};

const PartPill: React.FC<Props> = ({ part, selected, onClick }) => {
  const classes = useStyles();
  return (
    <Button
      className={`${classes.pill}`}
      onClick={onClick}
      disabled={selected}
      size="small"
    >
      <Typography variant="body1">{part}</Typography>
    </Button>
  );
};

export default PartPill;
