import { ButtonBase, Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

// some styles were lifted from https://material-ui.com/components/buttons/#complex-buttons
const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
    width: 200,
  },
  image: {
    position: 'relative',
    height: 200,
    width: 200,
    [theme.breakpoints.down('xs')]: {
      width: 200,
      height: 100,
    },
    '&:hover, &$focusVisible': {
      zIndex: 1,
      '& $imageBackdrop': {
        opacity: 0.15,
      },
      '& $imageTitle': {
        border: '4px solid currentColor',
      },
    },
  },
  focusVisible: {},
  imageButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
    borderRadius: 20,
  },
  imageBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    borderRadius: 20,
    transition: theme.transitions.create('opacity'),
  },
  imageTitle: {
    position: 'relative',
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${
      theme.spacing(1) + 6
    }px`,
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
    <Grid item className={classes.root}>
      <ButtonBase
        focusRipple
        className={classes.image}
        focusVisibleClassName={classes.focusVisible}
        onClick={onClick}
      >
        <span
          className={classes.imageSrc}
          style={{ backgroundImage: `url(/images/${genre}.png)` }}
        />
        <span className={classes.imageBackdrop} />
        <span className={classes.imageButton}>
          <Typography
            component="span"
            variant="h5"
            color="inherit"
            className={classes.imageTitle}
          >
            {genre}
          </Typography>
        </span>
      </ButtonBase>
    </Grid>
  );
};

export default GenreCard;
