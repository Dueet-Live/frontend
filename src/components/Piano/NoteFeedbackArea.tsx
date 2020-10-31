import { makeStyles } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { NoteFeedback } from '../Game/utils/NoteFeedback';
import {
  NoteFeedbackAreaHandleRef,
  NoteFeedbackMessage,
} from './types/noteFeedback';
import NoteFeedbackItem, {
  FEEDBACK_BUBBLE_ANIMATION_DURATION,
} from './NoteFeedbackItem';

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
  const timeoutIDsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutIDsRef.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

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
    const timeoutID = setTimeout(() => {
      dequeueFeedback(newFeedback);
      timeoutIDsRef.current.delete(timeoutID);
    }, FEEDBACK_BUBBLE_ANIMATION_DURATION);
    timeoutIDsRef.current.add(timeoutID);
  };

  handleRef.current = {
    enqueueFeedback,
  };

  return (
    <div className={classes.container}>
      {Array.from(feedbackQueue).map(feedback => (
        <NoteFeedbackItem key={feedback.id} feedback={feedback.num} />
      ))}
    </div>
  );
};

export default NoteFeedbackArea;
