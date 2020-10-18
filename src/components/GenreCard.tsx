import { CardActionArea, makeStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 110,
  },
  media: {
    height: 190,
  },
  overlay: {
    opacity: '0.8',
    '&:hover, &:active, &:focus': {
      opacity: '1.0',
    },
  },
  overlayText: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    color: 'white',
    fontSize: '18px',
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  },
}));

const GenreCard: React.FC<{
  genre: string;
  onClick: () => void;
}> = ({ genre, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} onClick={onClick}>
      <CardActionArea className={classes.overlay}>
        <CardMedia
          component="img"
          className={classes.media}
          image={require(`../images/${genre}.png`)}
        />
        <div className={classes.overlayText}>{genre}</div>
      </CardActionArea>
    </Card>
  );
};

export default GenreCard;
