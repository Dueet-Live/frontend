import { makeStyles, Box } from '@material-ui/core';
import React, { useEffect, useRef } from 'react';
import GameManager from '../../Game/Logic/GameManager';
import NoteFeedbackArea from '../NoteFeedbackArea';
import { NoteFeedbackAreaHandle } from '../types/noteFeedback';
import SmartPianoKey from './SmartPianoKey';

type Props = React.ComponentProps<typeof SmartPianoKey> & {
  gameManagerRef: React.MutableRefObject<GameManager>;
};

const useStyles = makeStyles(() => ({
  pianoKeyContainer: {
    position: 'relative',
  },
}));

const SmartPianoKeyWithFeedback: React.FC<Props> = props => {
  const classes = useStyles();
  const feedbackHandleRef = useRef<NoteFeedbackAreaHandle | null>(null);
  const { gameManagerRef, ...pianoKeyProps } = props;

  // Used for note feedback
  const feedbackManager = gameManagerRef.current.feedbackManager;

  useEffect(() => {
    if (feedbackManager === undefined) {
      return;
    }

    const keyIdentifier = props.index;
    feedbackManager.registerHandler(keyIdentifier, feedbackHandleRef);

    return () => {
      feedbackManager.unregisterHandler(keyIdentifier);
    };
  }, [feedbackManager, props.index]);

  return (
    <Box className={classes.pianoKeyContainer}>
      <NoteFeedbackArea handleRef={feedbackHandleRef} />
      <SmartPianoKey {...pianoKeyProps} />
    </Box>
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyWidth === nextProps.keyWidth &&
    prevProps.keyHeight === nextProps.keyHeight &&
    prevProps.index === nextProps.index &&
    prevProps.useTouchEvents === nextProps.useTouchEvents &&
    prevProps.playingNote.length === nextProps.playingNote.length // For smart piano, only my playing notes are included
  );
}

export default React.memo(SmartPianoKeyWithFeedback, areEqual);
