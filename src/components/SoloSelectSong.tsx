import {
  Fab,
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import PianoIcon from '../icons/PianoIcon';
import { RoomInfo } from '../types/roomInfo';
import { Song } from '../types/song';
import { choosePiece } from '../utils/socket';
import useGenres from '../utils/useGenres';
import useSongs from '../utils/useSongs';
import GenreCard from './GenreCard';
import { RoomContext } from './RoomContext';
import SoloReadyButton from './SoloReadyButton';
import SongCard from './SongCard';

const useStyles = makeStyles(theme => ({
  genreContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },
  songContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: 0,
    flex: '1 1 auto',
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
  genreCard: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '20%',
  },
  details: {
    padding: theme.spacing(2),
  },
}));

type Props = {
  chosenSong: Song | null;
  genre: string;
  setGenre: (genre: string) => void;
  isPieceDownloaded: boolean;
  handleStart: () => void;
  tryPiano: () => void;
};

const SoloSelectSong: React.FC<Props> = ({
  chosenSong,
  genre,
  setGenre,
  isPieceDownloaded,
  handleStart,
  tryPiano,
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
        <Grid
          container
          alignItems="stretch"
          justify="center"
          className={classes.genreContainer}
        >
          {genres.map(genre => (
            <Grid item key={genre.id} className={classes.genreCard}>
              <GenreCard
                genre={genre.name}
                onClick={() => setGenre(genre.name)}
              />
            </Grid>
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
        <Typography variant="h6" color="textPrimary">
          Song chosen: {chosenSong === null ? 'None' : chosenSong.name}{' '}
        </Typography>
        <SoloReadyButton
          disabled={chosenSong === null || downloadingSong}
          handleStart={handleStart}
        >
          {downloadingSong ? 'Loading' : 'Play'}
        </SoloReadyButton>
      </div>
      <Fab aria-label="try piano" className={classes.fab} onClick={tryPiano}>
        <PianoIcon />
      </Fab>
    </>
  );
};

export default SoloSelectSong;
