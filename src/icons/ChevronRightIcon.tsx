import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';
import { ReactComponent as icon } from './chevron-left.svg';

const ChevronLeftIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <SvgIcon component={icon} viewBox="0 0 24 24" {...props} />
);

export default ChevronLeftIcon;
