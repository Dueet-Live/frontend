import {
  Button,
  Dialog,
  DialogTitle,
  DialogTitleProps,
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { ArrowBack, Close, MusicNoteOutlined } from '@material-ui/icons';
import React, { useContext, useState } from 'react';
import PickASongIcon from '../icons/PickASongIcon';
import { RoomInfo } from '../types/RoomInfo';
import { choosePiece } from '../utils/socket';
import songList from '../utils/songs';
import GenreCard from './GenreCard';
import { RoomContext } from './RoomContext';
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

const PickASongButton: React.FC<{ isSolo?: boolean }> = ({ isSolo }) => {
  const [open, setOpen] = useState(false);

  const [genre, setGenre] = useState('');
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const {
    roomInfo: { piece },
    setRoomInfo,
  } = useContext(RoomContext);

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
        {Object.keys(songList).map(genre => (
          <GenreCard
            key={genre}
            genre={genre}
            onClick={() => setGenre(genre)}
          />
        ))}
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
        {songList[genre].map(songInfo => (
          <SongCard
            key={songInfo.id}
            songInfo={songInfo}
            onClick={() => {
              choosePiece(songInfo.id);
              setRoomInfo((prevState: RoomInfo) => ({
                ...prevState,
                piece: songInfo.id,
              }));
              handleClose();
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Button className={classes.pickASongButton} onClick={handleOpen}>
        {piece === undefined ? (
          <>
            <PickASongIcon className={classes.icon} />
            <Typography variant="body1">Pick a song</Typography>
          </>
        ) : (
          <>
            <MusicNoteOutlined className={classes.icon} />
            {/* TODO REMOVE HARDCODING */}
            <Typography variant="body1">
              Dance of the Sugar Plum Fairy
            </Typography>
          </>
        )}
      </Button>
      <Dialog
        fullScreen={fullScreen}
        fullWidth
        open={open}
        onClose={handleClose}
      >
        {genre === '' ? pickingGenre() : pickingSong()}
      </Dialog>
    </>
  );
};

export default PickASongButton;
