import {
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { RoomContext } from '../../contexts/RoomContext';
import { RoomInfo } from '../../types/roomInfo';
import { Song } from '../../types/song';
import { choosePiece } from '../../utils/socket';
import useGenres from '../../utils/useGenres';
import useSongs from '../../utils/useSongs';
import GenreCard from '../GenreCard';
import SpeedCustomization from '../shared/SpeedCustomization';
import SongCard from '../SongCard';
import SoloReadyButton from './SoloReadyButton';

const useStyles = makeStyles(theme => ({
  genreContainer: {
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'auto',
    height: 0,
    flex: '1 1 auto',
    alignContent: 'start',
  },
  songContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: 0,
    flex: '1 1 auto',
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  },
  details: {
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    display: 'flex',
    alignItems: 'flex-end',
  },
  speedContainer: {
    flex: '1 1 auto',
    textAlign: 'right',
    paddingLeft: '16px',
  },
}));

type Props = {
  chosenSong: Song | null;
  genre: string;
  setGenre: (genre: string) => void;
  isPieceDownloaded: boolean;
  handleStart: () => void;
  tryPiano: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
};

const SoloSelectSong: React.FC<Props> = ({
  chosenSong,
  genre,
  setGenre,
  isPieceDownloaded,
  handleStart,
  tryPiano,
  speed,
  setSpeed,
}) => {
  const classes = useStyles();

  const { setRoomInfo } = useContext(RoomContext);

  const genres = useGenres();
  const songs = useSongs('solo');

  const pickingGenre = () => {
    return (
      <>
        <Typography
          variant="h5"
          color="primary"
          align="center"
          className={classes.title}
        >
          Choose a genre
        </Typography>
        <Grid container justify="center" className={classes.genreContainer}>
          {genres.map(genre => (
            <GenreCard
              genre={genre.name}
              onClick={() => setGenre(genre.name)}
              key={genre.name}
            />
          ))}
        </Grid>
      </>
    );
  };

  const pickingSong = () => {
    return (
      <>
        <Typography
          variant="h5"
          color="primary"
          align="center"
          className={classes.title}
        >
          {genre}
        </Typography>
        <List className={classes.songContainer}>
          {songs
            .filter(song => song.genre.name === genre)
            .map(song => (
              <ListItem key={song.id}>
                <SongCard
                  song={song}
                  onClick={() => {
                    choosePiece(song.id);
                    // pre-empt, and for SoloRoom
                    setRoomInfo((prevState: RoomInfo) => ({
                      ...prevState,
                      piece: song.id,
                    }));
                  }}
                />
              </ListItem>
            ))}
        </List>
      </>
    );
  };

  const downloadingSong = chosenSong !== null && !isPieceDownloaded;

  return (
    <>
      <div className={classes.content}>
        {genre === '' ? pickingGenre() : pickingSong()}
      </div>
      <div className={classes.details}>
        <div>
          <Typography variant="h6" color="textPrimary" gutterBottom>
            Song chosen: {chosenSong === null ? 'None' : chosenSong.name}{' '}
          </Typography>
          <SoloReadyButton
            disabled={chosenSong === null || downloadingSong}
            handleStart={handleStart}
          >
            {downloadingSong ? 'Loading' : 'Play'}
          </SoloReadyButton>
        </div>
        <div className={classes.speedContainer}>
          <SpeedCustomization speed={speed} setSpeed={setSpeed} />
        </div>
      </div>
    </>
  );
};

export default SoloSelectSong;
