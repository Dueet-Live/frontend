import { makeStyles, Box } from '@material-ui/core';
import React, { useContext, useEffect, useRef } from 'react';
import { GameContext } from '../../../contexts/GameContext';
import NoteFeedbackArea from '../NoteFeedbackArea';
import { NoteFeedbackAreaHandle } from '../types/noteFeedback';
import SmartPianoKey from './SmartPianoKey';

type Props = React.ComponentProps<typeof SmartPianoKey>;

const useStyles = makeStyles(() => ({
  pianoKeyContainer: {
    position: 'relative',
  },
}));

const SmartPianoKeyWithFeedback: React.FC<Props> = props => {
  const classes = useStyles();

  // Used for note feedback
  const { gameManagerRef } = useContext(GameContext);
  const feedbackManager = gameManagerRef?.current.feedbackManager;
  const feedbackHandleRef = useRef<NoteFeedbackAreaHandle | null>(null);

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
      <SmartPianoKey {...props} />
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
