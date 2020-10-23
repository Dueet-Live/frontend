import {
  Button,
  Grid,
  makeStyles,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import RoomHeader from '../components/shared/RoomHeader';

const useStyles = makeStyles(theme => ({
  outer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  inner: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  button: {
    width: '148px',
  },
}));

const PinField = styled(TextField)({
  letterSpacing: '1rem',
  outline: 'none',
  width: '13rem',
  '& input': {
    textAlign: 'center',
    fontSize: '2rem',
  },
});

const roomIdRegex = /^\d{0,4}$/;

const DuetHome: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  const [roomId, setRoomId] = useState('');

  const handleRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (roomIdRegex.test(e.target.value)) {
      setRoomId(e.target.value);
    }
  };

  const handleRoomIdPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const roomLinkRegex = /^.*\?id=(?<roomId>\d{0,4})$/;
    let paste = e.clipboardData.getData('text');
    const match = paste.match(roomLinkRegex);
    const pastedRoomId = match?.groups?.roomId;
    if (!pastedRoomId) {
      return;
    }
    setRoomId(pastedRoomId);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && roomIdRegex.test(roomId)) {
      joinRoom();
    }
  };

  const joinRoom = () => {
    history.push(`/duet/play?id=${roomId}`);
  };

  const createRoom = () => {
    history.push('/duet/play');
  };

  const handleBack = () => {
    history.push('/');
  };

  return (
    <div className={classes.outer}>
      <RoomHeader>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to home
        </Button>
      </RoomHeader>
      <Grid
        container
        alignItems="center"
        justify="center"
        xs={12}
        className={classes.content}
      >
        <Grid
          item
          container
          xs={12}
          spacing={1}
          className={classes.inner}
          alignItems="center"
          justify="center"
        >
          <Grid item container xs={12} spacing={2} justify="center">
            <div>
              <Typography variant="h6">Enter Room PIN</Typography>
            </div>
            <Grid item xs={12}>
              <PinField
                placeholder="XXXX"
                onChange={handleRoomIdInput}
                value={roomId}
                autoFocus
                onKeyPress={handleKeyPress}
                onPaste={handleRoomIdPaste}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={joinRoom}
                disabled={roomId.length !== 4}
                className={classes.button}
              >
                Join
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">or</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={createRoom}
              className={classes.button}
            >
              Create a Room
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default DuetHome;
