import {
  Button,
  Grid,
  makeStyles,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import RoomHeader from '../components/RoomHeader';

const useStyles = makeStyles(theme => ({
  outer: {
    height: '100%',
  },
  inner: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  button: {
    width: '148px',
  },
  pinGrid: {
    borderStyle: 'solid',
    borderColor: theme.palette.primary.main,
    borderWidth: 'medium',
    borderRadius: '1em',
  },
  orText: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const PinField = styled(TextField)({
  letterSpacing: '1rem',
  outline: 'none',
  width: '13rem',
  '& input': {
    textAlign: 'center',
    fontSize: '3rem',
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

  return (
    <Grid
      container
      alignItems="center"
      justify="center"
      xs={12}
      className={classes.outer}
    >
      {/* TODO: don't render pickASong */}
      <Grid item container xs={12}>
        <RoomHeader isSolo />
      </Grid>

      <Grid
        item
        container
        xs={12}
        spacing={2}
        className={classes.inner}
        alignItems="center"
        justify="center"
      >
        <Grid
          item
          container
          xs={12}
          spacing={2}
          justify="center"
          className={classes.pinGrid}
        >
          <Grid item xs={12}>
            <Typography variant="h4">Enter Room PIN</Typography>
          </Grid>
          <Grid item xs={12}>
            <PinField
              placeholder="XXXX"
              onChange={handleRoomIdInput}
              value={roomId}
              autoFocus
              onKeyPress={handleKeyPress}
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
        <Grid item xs={12} className={classes.orText}>
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
  );
};

export default DuetHome;
