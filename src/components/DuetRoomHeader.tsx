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
import { PlayerContext } from '../contexts/PlayerContext';
import { RoomContext } from '../contexts/RoomContext';
import PlayerIcon from '../icons/PlayerIcon';
import SettingsIcon from '../icons/SettingsIcon';
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
  roomId: {
    marginRight: theme.spacing(1),
  },
}));

const DuetRoomHeader: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { me, friend } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);

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
          <>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.roomId}
            >
              {`Room ID: ${roomInfo.id}`}
            </Typography>
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
          </>
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
      <Box component="span" className={classes.empty} />
      {roomDetails()}
      <IconButton edge="end" size="small" className={classes.settingIcon}>
        <SettingsIcon />
      </IconButton>
    </RoomHeader>
  );
};

export default DuetRoomHeader;
