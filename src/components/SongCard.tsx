import { Button, makeStyles } from '@material-ui/core';
import React from 'react';
import { SongInfo } from '../types/SongInfo';

const useStyles = makeStyles({
  root: {
    height: '40px',
    backgroundColor: '#c5c9f7',
  },
});

const SongCard: React.FC<{
  songInfo: SongInfo;
  onClick: () => void;
}> = ({ songInfo, onClick }) => {
  const classes = useStyles();

  return (
    <Button fullWidth onClick={onClick} className={classes.root}>
      {songInfo.title}
    </Button>
  );
};

export default SongCard;
