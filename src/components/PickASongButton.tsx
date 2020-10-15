import {
  Button,
  Dialog,
  DialogTitle,
  DialogTitleProps,
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
import PickASongIcon from '../icons/PickASongIcon';
import { RoomInfo } from '../types/RoomInfo';
import { getReady } from '../utils/roomInfo';
import { choosePiece } from '../utils/socket';
import songList from '../utils/songs';
import GenreCard from './GenreCard';
import { PlayerContext } from './PlayerContext';
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
  genreContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
  songContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    overflowY: 'auto',
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
  const { roomInfo, setRoomInfo } = useContext(RoomContext);

  const { me } = useContext(PlayerContext);
  const { me: iAmReady } = getReady(roomInfo, me);
  const { piece } = roomInfo;

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
        <List className={classes.genreContainer}>
          {Object.keys(songList).map(genre => (
            <ListItem key={genre}>
              <GenreCard genre={genre} onClick={() => setGenre(genre)} />
            </ListItem>
          ))}
        </List>
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
          {songList[genre].map(songInfo => (
            <ListItem key={songInfo.id}>
              <SongCard
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
