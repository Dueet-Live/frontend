import { makeStyles, SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';
import { ReactComponent as icon0 } from '../svg/bear.svg';
import { ReactComponent as icon1 } from '../svg/cat.svg';
import { ReactComponent as icon2 } from '../svg/cow.svg';
import { ReactComponent as icon3 } from '../svg/dog.svg';
import { ReactComponent as icon4 } from '../svg/hamster.svg';
import { ReactComponent as icon5 } from '../svg/koala.svg';
import { ReactComponent as icon6 } from '../svg/lion.svg';
import { ReactComponent as icon7 } from '../svg/mouse.svg';
import { ReactComponent as icon8 } from '../svg/tiger.svg';
import { ReactComponent as icon9 } from '../svg/wolf.svg';

type Props = SvgIconProps & {
  num: number;
  myPlayerId: number;
};

const playerMap = [
  icon0,
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  icon6,
  icon7,
  icon8,
  icon9,
];

const useStyles = makeStyles(theme => ({
  root: {
    padding: '1px',
    borderRadius: '50%',
    height: '100%',
    width: '100%',
  },

  myIcon: {
    border: `3px solid ${theme.palette.me.main}`,
  },
  friendIcon: {
    border: `3px solid ${theme.palette.friend.main}`,
  },
}));

// Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
const PlayerIcon: React.FC<Props> = ({
  num,
  myPlayerId,
  className,
  ...props
}) => {
  const classes = useStyles();
  return (
    <SvgIcon
      component={playerMap[num]}
      viewBox="0 0 512 512"
      className={`${classes.root} ${
        num === myPlayerId ? classes.myIcon : classes.friendIcon
      } ${className}`}
      {...props}
    />
  );
};

export default PlayerIcon;
