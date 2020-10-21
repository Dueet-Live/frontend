import { Box, IconButton, makeStyles } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';
import SettingsIcon from '../icons/SettingsIcon';
import PickASongButton from './PickASongButton';
import RoomHeader from './shared/RoomHeader';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  settingIcon: {
    marginLeft: theme.spacing(1),
  },

  link: {
    color: '#0000EE',
  },
  empty: {
    flexGrow: 1,
  },
}));

const SoloRoomHeader: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <RoomHeader>
      <IconButton
        edge="start"
        className={classes.icon}
        size="small"
        onClick={() => history.push('/')}
      >
        <ArrowBack />
      </IconButton>
      {/* TODO Make this button responsive. It should truncate when too long */}
      <PickASongButton isPlaying={isPlaying} />
      <Box component="span" className={classes.empty} />
      <IconButton edge="end" size="small" className={classes.settingIcon}>
        <SettingsIcon />
      </IconButton>
    </RoomHeader>
  );
};

export default SoloRoomHeader;
