import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';
import { ReactComponent as icon } from '../svg/thumb-down.svg';

const ThumbDownIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon component={icon} viewBox="0 0 32 32" {...props} />
);

export default ThumbDownIcon;
