import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  makeStyles,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import PickASongIcon from '../icons/PickASongIcon';
import PlayerIcon from '../icons/PlayerIcon';
import SettingsIcon from '../icons/SettingsIcon';
import { PlayerContext } from './PlayerContext';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#FFF',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  settingIcon: {
    marginLeft: theme.spacing(1),
  },
  pickASongButton: {
    backgroundColor: '#c0b3d8de',
  },
  link: {
    color: '#0000EE',
  },
  empty: {
    flexGrow: 1,
  },
}));

const RoomHeader: React.FC<{ isSolo?: boolean; isPlaying?: boolean }> = ({
  isSolo,
  isPlaying,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { me, friend } = useContext(PlayerContext);

  const roomDetails = () => {
    if (isSolo) return <></>;

    // TODO: add a border like how it looks in the mockup
    return (
      <Box alignContent="center" display="flex">
        {me !== -1 && <PlayerIcon num={me} className={classes.icon} />}
        {friend !== null && (
          <PlayerIcon num={friend} className={classes.icon} />
        )}
        {me === -1 ||
          (friend === null && (
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
          ))}
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.icon}
            size="small"
            onClick={() => history.push('/')}
          >
            <ArrowBack />
          </IconButton>
          <Button className={classes.pickASongButton}>
            <PickASongIcon className={classes.icon} />
            <Typography variant="body1">Pick a song</Typography>
          </Button>
          <Box component="span" className={classes.empty} />
          {roomDetails()}
          <IconButton edge="end" size="small" className={classes.settingIcon}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* To take up space */}
    </div>
  );
};

export default RoomHeader;
