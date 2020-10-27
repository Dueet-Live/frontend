import {
  Box,
  Button,
  IconButton,
  Link,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { ArrowBack, MusicNoteOutlined } from '@material-ui/icons';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import PlayerIcon from '../../icons/PlayerIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import { updateReady } from '../../utils/socket';
import useSong from '../../utils/useSong';
import { Score } from '../Game/types';
import RoomHeader from '../shared/RoomHeader';

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
  header: {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%)',
  },
}));

type Props = {
  view: RoomView;
  setView: (view: RoomView) => void;
  score: Score;
};

const DuetRoomHeader: React.FC<Props> = ({ view, setView, score }) => {
  const classes = useStyles();
  const history = useHistory();
  const { me, friend } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const { piece } = roomInfo;
  const chosenSong = useSong(piece);
  const hideBackText = useMediaQuery('(min-width:400px)');

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

  const backButton = () => {
    let backText = '';
    let handleBack = () => {};

    switch (view) {
      case 'duet.lobby': {
        backText = 'Home';
        handleBack = () => history.push('/');
        break;
      }
      case 'duet.try': {
        backText = 'Lobby';
        handleBack = () => setView('duet.lobby');
        break;
      }
      case 'duet.play': {
        handleBack = () => {
          setView('duet.lobby');
          updateReady(false);
        };
      }
    }

    if (!hideBackText) {
      backText = '';
    }

    return (
      <Button onClick={handleBack} startIcon={<ArrowBack />}>
        {backText}
      </Button>
    );
  };

  const centerComponents = () => {
    if (view === 'duet.play' && chosenSong !== null) {
      const accuracy =
        score.total === 0
          ? 0
          : ((score.correct / score.total) * 100).toFixed(0);

      return (
        <>
          <MusicNoteOutlined color="action" />
          <Typography variant="body1" color="textPrimary">
            {chosenSong.name}
          </Typography>
          <Typography
            variant="h5"
            color="textPrimary"
            className={classes.header}
          >
            Accuracy: {accuracy}%
          </Typography>
        </>
      );
    }
  };

  return (
    <RoomHeader>
      {backButton()}
      {centerComponents()}
      <Box component="span" className={classes.empty} />
      {roomDetails()}
      <IconButton edge="end" size="small" className={classes.settingIcon}>
        <SettingsIcon />
      </IconButton>
    </RoomHeader>
  );
};

export default DuetRoomHeader;
