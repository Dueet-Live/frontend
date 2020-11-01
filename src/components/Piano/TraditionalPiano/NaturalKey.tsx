import { Box, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React, { useContext, useEffect, useRef } from 'react';
import { GameContext } from '../../../contexts/GameContext';
import { PlayerContext } from '../../../contexts/PlayerContext';
import NoteFeedbackArea from '../NoteFeedbackArea';
import { NoteFeedbackAreaHandle } from '../types/noteFeedback';
import { PlayingNote } from '../types/playingNote';
import './TraditionalPiano.css';

type Props = {
  note: number;
  playingNote: PlayingNote[];
  keyWidth: number;
  keyHeight: number;
  topText: string;
  bottomText: string;
  eventHandlers: any;
};

const useStyles = makeStyles(() => ({
  pianoKeyContainer: {
    position: 'relative',
  },
}));

const NaturalKey: React.FC<Props> = ({
  note,
  playingNote,
  keyWidth,
  keyHeight,
  topText = '',
  bottomText,
  eventHandlers,
}) => {
  const classes = useStyles();
  const { me } = useContext(PlayerContext);

  const theme = useTheme();
  const isMobilePortrait = useMediaQuery(theme.breakpoints.down(400));
  const fontSize = isMobilePortrait ? 0.5 : 1;

  // Used for note feedback
  const { gameManagerRef } = useContext(GameContext);
  const feedbackManager = gameManagerRef?.current.feedbackManager;
  const feedbackHandleRef = useRef<NoteFeedbackAreaHandle | null>(null);

  useEffect(() => {
    if (feedbackManager === undefined) {
      return;
    }

    const keyIdentifier = note;
    feedbackManager.registerHandler(keyIdentifier, feedbackHandleRef);

    return () => {
      feedbackManager.unregisterHandler(keyIdentifier);
    };
  }, [feedbackManager, note]);

  const getClassName = () => {
    if (playingNote.length === 0) {
      return '';
    } else {
      if (playingNote[0].playerId === me) {
        return 'traditional-piano__natural-key--playing-by-me';
      } else {
        return 'traditional-piano__natural-key--playing-by-others';
      }
    }
  };

  return (
    <Box className={classes.pianoKeyContainer}>
      <NoteFeedbackArea handleRef={feedbackHandleRef} />
      <button
        className={`traditional-piano__natural-key ${getClassName()}`}
        style={{ width: keyWidth, height: keyHeight }}
        data-note={note}
        {...eventHandlers}
      >
        <div
          className={'traditional-piano__text-container'}
          style={{ fontSize: `${fontSize}rem` }}
        >
          <div className="traditional-piano__text--top-text">{topText}</div>
          <div className="traditional-piano__text--bottom-text">
            {bottomText}
          </div>
        </div>
      </button>
    </Box>
  );
};

export default NaturalKey;
