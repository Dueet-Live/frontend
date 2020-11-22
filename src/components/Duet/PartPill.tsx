import { Button, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Part } from '../../types/messages';
import { getDisplayNameForPart } from '../../utils/partNames';

const useStyles = makeStyles(theme => ({
  pill: {
    borderRadius: '9999px',
    textAlign: 'center',
    background: theme.palette.complementary.main,
    color: 'white',
    [theme.breakpoints.down('sm')]: {
      height: '1.5rem',
    },
    width: '40%',
    '&:disabled': {
      background: theme.palette.secondaryComplementary.main,
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
      <Typography variant="body2">{getDisplayNameForPart(part)}</Typography>
    </Button>
  );
};

export default PartPill;
