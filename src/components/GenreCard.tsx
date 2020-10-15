import { makeStyles } from '@material-ui/core';
import React from 'react';
import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';

const useStyles = makeStyles({
  root: {
    maxWidth: 110,
  },
  media: {
    height: 190,
  },
  overlay: {
    position: 'absolute',
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px',
    backgroundColor: '#fff',
    opacity: '0.3',
    '&:hover, &:active, &:focus': {
      opacity: '0',
    },
  },
  overlayText: {
    position: 'absolute',
    bottom: '20px',
    right: '25px',
    color: 'white',
    fontSize: '18px',
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  },
});

const GenreCard: React.FC<{
  genre: string;
  onClick: () => void;
}> = ({ genre, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} onClick={onClick}>
      <CardMedia
        component="img"
        className={classes.media}
        image={require(`../images/${genre}.png`)}
      />
      <div className={classes.overlay} />
      <div className={classes.overlayText}>{genre}</div>
    </Card>
  );
};

export default GenreCard;
