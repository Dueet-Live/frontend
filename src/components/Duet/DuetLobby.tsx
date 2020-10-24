import {
  Fab,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { RoomContext } from '../../contexts/RoomContext';
import PianoIcon from '../../icons/PianoIcon';
import PlayerIcon from '../../icons/PlayerIcon';
import { Part } from '../../types/messages';
import { Song } from '../../types/Song';
import { getMyPart, getPartsSelection } from '../../utils/roomInfo';
import { choosePart } from '../../utils/socket';
import DuetReadyButton from './DuetReadyButton';
import PickASongButton from '../PickASongButton';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    alignItems: 'stretch',
  },
  content: {
    flexGrow: 1,
  },
  fab: {
    backgroundColor: '#7988FA',
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#A5AFFF',
    },
  },
  readyButton: {
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // TODO: put in theme colors
  primo: {
    backgroundColor: '#B0A3F9',
  },
  secondo: {
    backgroundColor: '#F2BC92',
  },
  paper: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '70%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    bottom: 0,
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  },
  partCard: {
    height: '50%',
  },
  heading: {
    paddingTop: theme.spacing(1),
  },
  form: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  error: {
    position: 'absolute',
    bottom: '25%',
    color: 'red',
  },
}));

type Props = {
  chosenSong: Song | null;
  isPieceDownloaded: boolean;
  tryPiano: () => void;
};

const DuetLobby: React.FC<Props> = ({
  chosenSong,
  isPieceDownloaded,
  tryPiano,
}) => {
  const classes = useStyles();
  const { me: myPlayerId } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const { primo, secondo } = getPartsSelection(roomInfo);
  const myPart = getMyPart(roomInfo, myPlayerId);

  const handlePartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === '' || (val !== 'primo' && val !== 'secondo')) return;

    choosePart(val);
  };

  const partCard = (part: Part, className: string, players: number[]) => {
    return (
      <Grid
        item
        xs={6}
        container
        direction="column"
        alignItems="center"
        spacing={2}
        className={classes.partCard}
      >
        {/* TODO make player icon larger on larger screen sizes */}
        <Paper elevation={5} className={`${classes.paper} ${className}`}>
          {players.map(id => (
            <PlayerIcon num={id} key={id} myPlayerId={myPlayerId} />
          ))}
          <Typography variant="body1" align="center" className={classes.label}>
            {part}
          </Typography>
        </Paper>
      </Grid>
    );
  };

  const isDownloadingSong = chosenSong !== null && !isPieceDownloaded;

  let error = '';
  if (myPart === null) {
    error = 'Choose a part with the buttons on the left!';
  } else if (primo.length === 2 || secondo.length === 2) {
    error = 'Both of you must play different parts!';
  } else if (primo.length === 0 || secondo.length === 0) {
    error = 'Waiting for your friend to pick a part...';
  }

  return (
    <Grid container direction="column" className={classes.root}>
      <Typography
        variant="h5"
        color="textPrimary"
        align="center"
        className={classes.heading}
      >
        Lobby
      </Typography>
      <Grid item container className={classes.content}>
        <Grid
          item
          xs={7}
          spacing={2}
          container
          direction="column"
          justify="center"
          className={classes.form}
        >
          <Grid item>
            <Typography variant="body1" color="textPrimary">
              Pick a song
            </Typography>
            <PickASongButton />
          </Grid>
          <Grid item>
            <Typography variant="body1" color="textPrimary">
              Choose your part
            </Typography>
            <RadioGroup
              row
              aria-label="part"
              name="part"
              value={myPart}
              onChange={handlePartChange}
            >
              <FormControlLabel
                value="primo"
                control={<Radio />}
                label="Primo"
              />
              <FormControlLabel
                value="secondo"
                control={<Radio />}
                label="Secondo"
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Grid item xs={5} container justify="center" alignItems="center">
          {partCard('primo', classes.primo, primo)}
          {partCard('secondo', classes.secondo, secondo)}
          <Typography variant="body2" align="center" className={classes.error}>
            {error}
          </Typography>
        </Grid>
      </Grid>
      <div className={classes.readyButton}>
        <DuetReadyButton isDownloadingSong={isDownloadingSong} />
      </div>
      <Fab aria-label="try piano" className={classes.fab} onClick={tryPiano}>
        <PianoIcon />
      </Fab>
    </Grid>
  );
};

export default DuetLobby;
