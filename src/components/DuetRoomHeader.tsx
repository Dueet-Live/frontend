import {
  Box,
  IconButton,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import PlayerIcon from '../icons/PlayerIcon';
import SettingsIcon from '../icons/SettingsIcon';
import PickASongButton from './PickASongButton';
import { PlayerContext } from './PlayerContext';
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

const DuetRoomHeader: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const classes = useStyles();
  const history = useHistory();
  const { me, friend } = useContext(PlayerContext);

  const roomDetails = () => {
    if (me === -1) {
      // TODO: add a border like how it looks in the mockup
      return (
        <Typography variant="body1" color="textPrimary">
          Connecting...
        </Typography>
      );
    }

    return (
      <Box alignContent="center" display="flex">
        <PlayerIcon num={me} myPlayerId={me} className={classes.icon} />
        {friend !== null && (
          <PlayerIcon num={friend} myPlayerId={me} className={classes.icon} />
        )}
        {friend === null && (
          <Link
            component="button"
            variant="body1"
            className={classes.link}
            onClick={
              async () => navigator.clipboard.writeText(window.location.href)
              // TODO add a notification
            }
          >
            (Copy link)
          </Link>
        )}
      </Box>
    );
  };

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
      {roomDetails()}
      <IconButton edge="end" size="small" className={classes.settingIcon}>
        <SettingsIcon />
      </IconButton>
    </RoomHeader>
  );
};

export default DuetRoomHeader;
