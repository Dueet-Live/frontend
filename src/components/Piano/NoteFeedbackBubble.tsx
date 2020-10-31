import { makeStyles } from '@material-ui/core';
import React, { useCallback } from 'react';
import CrossIcon from '../../icons/CrossIcon';
import StarIcon from '../../icons/StarIcon';
import ThumbDownIcon from '../../icons/ThumbDownIcon';
import ThumbUpIcon from '../../icons/ThumbUpIcon';
import { NoteFeedback } from '../Game/utils/NoteFeedback';

export const FEEDBACK_BUBBLE_ANIMATION_DURATION = 1200;

const useStyles = makeStyles(theme => ({
  icon: {
    width: '45%',
    height: 'auto',
  },
  feedback: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    animationName: '$feedbackAnimation',
    animationTimingFunction: 'ease',
    animationDuration: `${FEEDBACK_BUBBLE_ANIMATION_DURATION}ms`,
    animationIterationCount: 1,
    animationFillMode: 'forwards',
  },
  '@keyframes feedbackAnimation': {
    '0%': {
      transform: `translateY(50%)`,
      opacity: 1,
    },
    '100%': {
      transform: `translateY(0)`,
      opacity: 0,
    },
  },
}));

// eslint-disable-next-line react/display-name
const NoteFeedbackBubble = React.memo(
  ({ feedback }: { feedback: NoteFeedback }) => {
    const classes = useStyles();
    const getFeedbackContent = useCallback((feedback: NoteFeedback) => {
      switch (feedback) {
        case NoteFeedback.MISS:
          return <CrossIcon className={classes.icon} />;
        case NoteFeedback.WRONG: // Not shown
          return 'Wrong';
        case NoteFeedback.BAD:
          return <ThumbDownIcon className={classes.icon} />;
        case NoteFeedback.GOOD: // Not shown
          return 'Good';
        case NoteFeedback.GREAT:
          return <ThumbUpIcon className={classes.icon} />;
        case NoteFeedback.PERFECT:
          return <StarIcon className={classes.icon} />;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div className={classes.feedback}>{getFeedbackContent(feedback)}</div>
    );
  },
  () => true
);

export default NoteFeedbackBubble;
