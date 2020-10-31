import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { NoteFeedback } from '../Game/utils/NoteFeedback';
import {
  NoteFeedbackAreaHandleRef,
  NoteFeedbackMessage,
} from './types/noteFeedback';
import NoteFeedbackBubble, {
  FEEDBACK_BUBBLE_ANIMATION_DURATION,
} from './NoteFeedbackBubble';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    height: `100%`,
    top: '-100%',
    width: '100%',
  },
});

const generateNoteFeedbackMessage = (
  feedback: NoteFeedback
): NoteFeedbackMessage => {
  return {
    id: uuid(),
    num: feedback,
  };
};

const NoteFeedbackArea: React.FC<{
  handleRef: NoteFeedbackAreaHandleRef;
}> = ({ handleRef }) => {
  const classes = useStyles();
  const [feedbackQueue, setFeedbackQueue] = useState<Set<NoteFeedbackMessage>>(
    new Set()
  );

  const dequeueFeedback = (note: NoteFeedbackMessage) => {
    setFeedbackQueue(oldFeedbackQueue => {
      const newFeedbackQueue = new Set(oldFeedbackQueue);
      newFeedbackQueue.delete(note);
      return newFeedbackQueue;
    });
  };

  const enqueueFeedback = (feedback: NoteFeedback) => {
    const newFeedback = generateNoteFeedbackMessage(feedback);
    setFeedbackQueue(oldFeedbackQueue => {
      const newFeedbackQueue = new Set(oldFeedbackQueue);
      newFeedbackQueue.add(newFeedback);
      return newFeedbackQueue;
    });
    setTimeout(() => {
      dequeueFeedback(newFeedback);
    }, FEEDBACK_BUBBLE_ANIMATION_DURATION);
  };

  handleRef.current = {
    enqueueFeedback,
  };

  return (
    <div className={classes.container}>
      {Array.from(feedbackQueue).map(feedback => (
        <NoteFeedbackBubble key={feedback.id} feedback={feedback.num} />
      ))}
    </div>
  );
};

export default NoteFeedbackArea;
