import { Button, makeStyles } from '@material-ui/core';
import React from 'react';
import { Song } from '../types/song';

const useStyles = makeStyles({
  root: {
    height: '40px',
    backgroundColor: '#c5c9f7',
    width: '70%',
    margin: 'auto',
  },
});

const SongCard: React.FC<{
  song: Song;
  onClick: () => void;
}> = ({ song, onClick }) => {
  const classes = useStyles();

  return (
    <Button fullWidth onClick={onClick} className={classes.root}>
      {song.name}
    </Button>
  );
};

export default SongCard;
