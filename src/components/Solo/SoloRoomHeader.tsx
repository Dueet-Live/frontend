import {
  Box,
  Button,
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { ArrowBack, MusicNoteOutlined } from '@material-ui/icons';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import SettingsIcon from '../../icons/SettingsIcon';
import useSong from '../../utils/useSong';
import { Score } from '../Game/types';
import RoomHeader from '../shared/RoomHeader';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  settingIcon: {
    marginLeft: theme.spacing(1),
  },

  link: {
    color: '#0000EE',
  },
  empty: {
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%)',
  },
}));

type Props = {
  score: Score;
  view: RoomView;
  selectedGenre: string;
  setGenre: (genre: string) => void;
  setView: (roomView: RoomView) => void;
  resetScore: () => void;
};

const SoloRoomHeader: React.FC<Props> = ({
  score,
  view,
  selectedGenre,
  setGenre,
  setView,
  resetScore,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const {
    roomInfo: { piece },
  } = useContext(RoomContext);
  const chosenSong = useSong(piece);
  const hideBackText = useMediaQuery('(min-width:400px)');

  const backButton = () => {
    let backText = '';
    let handleBack = () => {};

    switch (view) {
      case 'solo.select': {
        if (selectedGenre) {
          backText = 'Genres';
          handleBack = () => setGenre('');
        } else {
          backText = 'Home';
          handleBack = () => history.push('/');
        }
        break;
      }
      case 'solo.try':
      case 'solo.play': {
        if (view === 'solo.try') {
          backText = 'Song Selection';
        }
        handleBack = () => {
          resetScore();
          setView('solo.select');
        };
        break;
      }
    }

    if (!hideBackText) {
      backText = '';
    }

    return (
      <Button onClick={handleBack} startIcon={<ArrowBack />}>
        {backText}
      </Button>
    );
  };

  const centerComponents = () => {
    if (view === 'solo.select') {
      return (
        <Typography variant="h6" color="textPrimary" className={classes.header}>
          Song Selection
        </Typography>
      );
    }

    if (view === 'solo.play' && chosenSong !== null) {
      const accuracy =
        score.total === 0
          ? 0
          : ((score.correct / score.total) * 100).toFixed(0);
      return (
        <>
          <MusicNoteOutlined color="action" />
          <Typography variant="body1" color="textPrimary">
            {chosenSong.name}
          </Typography>

          <Typography
            variant="h5"
            color="textPrimary"
            className={classes.header}
          >
            Accuracy: {accuracy}%
          </Typography>
        </>
      );
    }
  };

  return (
    <RoomHeader>
      {backButton()}
      {centerComponents()}
      <Box component="span" className={classes.empty} />
      <IconButton edge="end" size="small" className={classes.settingIcon}>
        <SettingsIcon />
      </IconButton>
    </RoomHeader>
  );
};

export default SoloRoomHeader;
