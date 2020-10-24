import {
  Button,
  Dialog,
  DialogTitle,
  DialogTitleProps,
  Grid,
  IconButton,
  List,
  ListItem,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { ArrowBack, Close, MusicNoteOutlined } from '@material-ui/icons';
import React, { useContext, useState } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { RoomContext } from '../contexts/RoomContext';
import PickASongIcon from '../icons/PickASongIcon';
import { RoomInfo } from '../types/RoomInfo';
import { getReady } from '../utils/roomInfo';
import { choosePiece } from '../utils/socket';
import useGenres from '../utils/useGenres';
import useSong from '../utils/useSong';
import useSongs from '../utils/useSongs';
import GenreCard from './GenreCard';
import SongCard from './SongCard';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  pickASongButton: {
    backgroundColor: '#c0b3d8de',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  backButton: {
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(1),
  },
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  genreContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: theme.spacing(1),
  },
  genreCard: {
    width: '20%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  songContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    overflowY: 'auto',
    height: 200,
  },
  dialogNotFullscreen: {
    height: 300,
  },
}));

type DialogTitleWithButtonsProps = DialogTitleProps & {
  onClose: () => void;
  onBack?: () => void;
};

const DialogTitleWithButtons: React.FC<DialogTitleWithButtonsProps> = ({
  onClose,
  onBack,
  children,
  ...props
}) => {
  const classes = useStyles();
  return (
    <DialogTitle disableTypography className={classes.root} {...props}>
      {onBack && (
        <IconButton
          aria-label="back"
          className={classes.backButton}
          onClick={onBack}
        >
          <ArrowBack />
        </IconButton>
      )}
      <Typography variant="h6" align="center" color="primary">
        {children}
      </Typography>
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onClose}
      >
        <Close />
      </IconButton>
    </DialogTitle>
  );
};

const PickASongButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [genre, setGenre] = useState('');

  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const { roomInfo, setRoomInfo } = useContext(RoomContext);

  const { me } = useContext(PlayerContext);
  const { me: iAmReady } = getReady(roomInfo, me);
  const { piece } = roomInfo;

  const genres = useGenres();
  const songs = useSongs('duet');
  const chosenSong = useSong(piece);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const pickingGenre = () => {
    return (
      <>
        <DialogTitleWithButtons onClose={handleClose}>
          Choose a Genre
        </DialogTitleWithButtons>
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
        <DialogTitleWithButtons
          onClose={handleClose}
          onBack={() => setGenre('')}
        >
          Choose a Song
        </DialogTitleWithButtons>
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
                    handleClose();
                  }}
                />
              </ListItem>
            ))}
        </List>
      </>
    );
  };

  return (
    <>
      <Button
        className={classes.pickASongButton}
        onClick={handleOpen}
        disabled={iAmReady}
      >
        {chosenSong === null ? (
          <>
            <PickASongIcon className={classes.icon} />
            <Typography variant="body1">No song selected</Typography>
          </>
        ) : (
          <>
            <MusicNoteOutlined className={classes.icon} />
            <Typography variant="body1">{chosenSong.name}</Typography>
          </>
        )}
      </Button>
      <Dialog
        fullScreen={fullScreen}
        fullWidth
        open={open}
        onClose={handleClose}
        PaperProps={
          fullScreen ? {} : { className: classes.dialogNotFullscreen }
        }
      >
        {genre === '' ? pickingGenre() : pickingSong()}
      </Dialog>
    </>
  );
};

export default PickASongButton;
