import { makeStyles } from '@material-ui/core';
import React from 'react';
import { NoteFeedback } from '../Game/utils/NoteFeedback';

export const FEEDBACK_BUBBLE_ANIMATION_DURATION = 1000;

const useAnimationStyles = ({ feedback }: { feedback: NoteFeedback }) => {
  const getFeedbackContent = (feedback: NoteFeedback) => {
    switch (feedback) {
      case NoteFeedback.MISS:
        return '❌';
      case NoteFeedback.WRONG: // Not shown
        return 'Wrong';
      case NoteFeedback.BAD:
        return '👎';
      case NoteFeedback.GOOD: // Not shown
        return 'Good';
      case NoteFeedback.GREAT:
        return '👍';
      case NoteFeedback.PERFECT:
        return '⭐️';
    }
  };

  return makeStyles(theme => ({
    // Make object move in a curved path
    // https://tobiasahlin.com/blog/curved-path-animations-in-css
    feedback: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      '&:after': {
        content: `"${getFeedbackContent(feedback)}"`,
        [theme.breakpoints.down('sm')]: {
          fontSize: theme.typography.body1.fontSize,
        },
        [theme.breakpoints.up('md')]: {
          fontSize: theme.typography.h3.fontSize,
        },
        position: 'absolute',
        animationName: '$feedbackYAxis',
        animationTimingFunction: 'ease-out',
        animationDuration: `${FEEDBACK_BUBBLE_ANIMATION_DURATION}ms`,
        animationIterationCount: 1,
        animationFillMode: 'forwards',
      },
    },
    '@keyframes feedbackYAxis': {
      '0%': {
        transform: `translateY(100%)`,
        opacity: 1,
      },
      '100%': {
        transform: `translateY(0)`,
        opacity: 0,
      },
    },
  }))();
};

const NoteFeedbackBubble = React.memo(
  ({ feedback }: { feedback: NoteFeedback }) => {
    const classes = useAnimationStyles({
      feedback,
    });
    return <div className={classes.feedback}></div>;
  },
  () => true
);

export default NoteFeedbackBubble;
