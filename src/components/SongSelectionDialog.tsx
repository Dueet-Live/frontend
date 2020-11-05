import {
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
import { ArrowBack, Close } from '@material-ui/icons';
import React, { useContext, useState } from 'react';
import { RoomContext } from '../contexts/RoomContext';
import { RoomInfo } from '../types/roomInfo';
import { choosePiece } from '../utils/socket';
import useGenres from '../utils/useGenres';
import useSongs from '../utils/useSongs';
import GenreCard from './GenreCard';
import SongCard from './SongCard';

const useStyles = makeStyles(theme => ({
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
  title: {
    margin: 0,
    padding: theme.spacing(2),
  },
  genreContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(1),
    overflowY: 'auto',
    alignContent: 'start',
  },
  genreCard: {
    margin: theme.spacing(1),
  },
  songContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    overflowY: 'auto',
    height: 500,
  },
  dialogNotFullscreen: {
    height: 600,
    paddingBottom: theme.spacing(2),
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
    <DialogTitle disableTypography className={classes.title} {...props}>
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

type Props = {
  open: boolean;
  handleClose: () => void;
};

const SongSelectionDialog: React.FC<Props> = ({ open, handleClose }) => {
  const [genre, setGenre] = useState('');

  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const { setRoomInfo } = useContext(RoomContext);

  const genres = useGenres();
  const songs = useSongs('duet');

  const pickingGenre = () => {
    return (
      <>
        <DialogTitleWithButtons onClose={handleClose}>
          Choose a Genre
        </DialogTitleWithButtons>
        <Grid container justify="center" className={classes.genreContainer}>
          {genres.map(genre => (
            <GenreCard
              key={genre.id}
              genre={genre.name}
              onClick={() => setGenre(genre.name)}
            />
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
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      open={open}
      onClose={handleClose}
      PaperProps={fullScreen ? {} : { className: classes.dialogNotFullscreen }}
    >
      {genre === '' ? pickingGenre() : pickingSong()}
    </Dialog>
  );
};

export default SongSelectionDialog;