import { Box, makeStyles } from '@material-ui/core';
import React, { useContext, useEffect, useRef } from 'react';
import { GameContext } from '../../../contexts/GameContext';
import { PlayerContext } from '../../../contexts/PlayerContext';
import {
  calculateBlackKeyWidth,
  calculateBlackKeyHeight,
} from '../../../utils/calculateTraditionalKeyboardDimension';
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
    transform: 'translateX(-50%)',
    zIndex: 99,
    pointerEvents: 'none',
  },
}));

const AccidentalKey: React.FC<Props> = ({
  note,
  playingNote,
  keyWidth: whiteKeyWidth,
  keyHeight: whiteKeyHeight,
  topText = '',
  bottomText,
  eventHandlers,
}) => {
  const classes = useStyles();
  const { me } = useContext(PlayerContext);

  const keyWidth = calculateBlackKeyWidth(whiteKeyWidth);
  const keyHeight = calculateBlackKeyHeight(whiteKeyHeight);

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
        return 'traditional-piano__accidental-key--playing-by-me';
      } else {
        return 'traditional-piano__accidental-key--playing-by-others';
      }
    }
  };

  return (
    <div className={'traditional-piano__accidental-key__wrapper'}>
      <Box
        className={classes.pianoKeyContainer}
        style={{ width: whiteKeyWidth, height: whiteKeyHeight }}
      >
        <NoteFeedbackArea handleRef={feedbackHandleRef} />
        <button
          className={`traditional-piano__accidental-key ${getClassName()}`}
          style={{
            width: keyWidth,
            height: keyHeight,
            left: (whiteKeyWidth - keyWidth) / 2,
          }}
          data-note={note}
          {...eventHandlers}
        >
          <div className={'traditional-piano__text-container'}>
            <div className="traditional-piano__text--top-text">{topText}</div>
            <div className="traditional-piano__text--bottom-text">
              {bottomText}
            </div>
          </div>
        </button>
      </Box>
    </div>
  );
};

export default AccidentalKey;
