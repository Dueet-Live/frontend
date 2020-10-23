import {
  Box,
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
  header: {
    flexGrow: 0,
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
    // If user pasted the ID, let it happen
    let paste = e.clipboardData.getData('text');
    if (roomIdRegex.test(paste)) {
      return;
    }

    // Otherwise, if user pasted a room link, extract the id from the link
    e.preventDefault();
    const roomLinkRegex = /^.*\?id=(?<roomId>\d{0,4})$/;
    const match = paste.match(roomLinkRegex);
    const pastedRoomId = match?.groups?.roomId;

    // If it's not a room link, don't paste it
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
    <Box className={classes.outer}>
      <Box className={classes.header}>
        <RoomHeader>
          <Button onClick={handleBack} startIcon={<ArrowBack />}>
            Back to home
          </Button>
        </RoomHeader>
      </Box>
      <Grid
        container
        alignItems="center"
        justify="center"
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
            <Box>
              <Typography variant="h6">Enter Room PIN</Typography>
            </Box>
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
    </Box>
  );
};

export default DuetHome;
