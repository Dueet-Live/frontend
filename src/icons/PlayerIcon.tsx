import { SvgIcon, SvgIconProps } from '@material-ui/core';
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
};

// Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
const PlayerIcon: React.FC<Props> = ({ num, ...props }) => {
  const getIcon = () => {
    switch (num) {
      case 0:
        return icon0;
      case 1:
        return icon1;
      case 2:
        return icon2;
      case 3:
        return icon3;
      case 4:
        return icon4;
      case 5:
        return icon5;
      case 6:
        return icon6;
      case 7:
        return icon7;
      case 8:
        return icon8;
      case 9:
        return icon9;
      default:
        return icon0;
    }
  };
  return <SvgIcon component={getIcon()} viewBox="0 0 512 512" {...props} />;
};

export default PlayerIcon;
