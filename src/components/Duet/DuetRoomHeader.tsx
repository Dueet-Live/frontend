import {
  Box,
  Button,
  Link,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { ArrowBack, MusicNoteOutlined } from '@material-ui/icons';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import PlayerIcon from '../../icons/PlayerIcon';
import { updateReady } from '../../utils/socket';
import useSong from '../../utils/useSong';
import { FlyingNotes, FlyingNotesHandleRef } from '../Game/FlyingNotes';
import { Score } from '../Game/types';
import RoomHeader from '../shared/RoomHeader';

const useStyles = makeStyles(theme => ({
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
  avatarBox: {
    position: 'relative',
    marginRight: theme.spacing(2),
    height: '2em',
    width: '2em',
  },
}));

type Props = {
  view: RoomView;
  setView: (view: RoomView) => void;
  score: Score;
  resetScore: () => void;
  myFlyingNotesHandleRef: FlyingNotesHandleRef;
  friendFlyingNotesHandleRef: FlyingNotesHandleRef;
};

const DuetRoomHeader: React.FC<Props> = ({
  view,
  setView,
  score,
  resetScore,
  myFlyingNotesHandleRef,
  friendFlyingNotesHandleRef,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { me, friend } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const setNotification = useContext(NotificationContext);
  const { piece } = roomInfo;
  const chosenSong = useSong(piece);
  const hideBackText = useMediaQuery('(min-width:400px)');

  const playerIconWithFlyingNotes = (
    num: number,
    handleRef: FlyingNotesHandleRef
  ) => {
    return (
      <Box className={classes.avatarBox}>
        <PlayerIcon num={num} myPlayerId={me} />
        <FlyingNotes handleRef={handleRef} isMe={num === me} />
      </Box>
    );
  };

  const roomDetails = () => {
    if (me === -1) {
      return (
        <Typography variant="body1" color="textPrimary">
          Connecting...
        </Typography>
      );
    }

    return (
      <Box alignItems="center" display="flex">
        {playerIconWithFlyingNotes(me, myFlyingNotesHandleRef)}
        {friend !== null &&
          playerIconWithFlyingNotes(friend, friendFlyingNotesHandleRef)}
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
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setNotification({
                  message: 'Link copied to clipboard.',
                  severity: 'success',
                });
              }}
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
          resetScore();
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
    </RoomHeader>
  );
};

export default DuetRoomHeader;
