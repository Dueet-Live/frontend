import { CardActionArea, makeStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    opacity: '0.8',
    '&:hover, &:active, &:focus': {
      opacity: '1.0',
    },
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    backgroundSize: 'cover',
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
      <CardActionArea
        className={classes.overlay}
        style={{ backgroundImage: `url(images/${genre}.png)` }}
      >
        <div className={classes.overlayText}>{genre}</div>
      </CardActionArea>
    </Card>
  );
};

export default GenreCard;
