import { makeStyles } from '@material-ui/core';
import React from 'react';
import { NoteFeedback } from '../Game/utils/NoteFeedback';

export const FEEDBACK_BUBBLE_ANIMATION_DURATION = 800;

const useAnimationStyles = ({ feedback }: { feedback: NoteFeedback }) => {
  const getFeedbackContent = (feedback: NoteFeedback) => {
    switch (feedback) {
      case NoteFeedback.MISSED:
        return 'Missed';
      case NoteFeedback.WRONG:
        return 'Wrong';
      case NoteFeedback.BAD:
        return 'Bad';
      case NoteFeedback.GOOD:
        return 'Not Bad';
      case NoteFeedback.GREAT:
        return 'Great';
      case NoteFeedback.PERFECT:
        return 'Perfect';
    }
  };

  const getFeedbackColor = (feedback: NoteFeedback) => {
    switch (feedback) {
      case NoteFeedback.MISSED:
        return '#8B0000';
      case NoteFeedback.WRONG:
        return '#F08080';
      case NoteFeedback.BAD:
        return '#F0E68C';
      case NoteFeedback.GOOD:
        return '#DAA520';
      case NoteFeedback.GREAT:
        return '#8FBC8F';
      case NoteFeedback.PERFECT:
        return '#006400';
    }
  };

  return makeStyles(theme => ({
    // Make object move in a curved path
    // https://tobiasahlin.com/blog/curved-path-animations-in-css
    feedback: {
      position: 'relative',
      '&:after': {
        content: `"${getFeedbackContent(feedback)}"`,
        [theme.breakpoints.down('sm')]: {
          fontSize: theme.typography.body2.fontSize,
        },
        [theme.breakpoints.up('md')]: {
          fontSize: theme.typography.h4.fontSize,
        },
        color: `${getFeedbackColor(feedback)}`,
        position: 'absolute',
        textAlign: 'center',
        animationName: '$feedbackYAxis',
        animationTimingFunction: 'ease-in',
        animationDuration: `${FEEDBACK_BUBBLE_ANIMATION_DURATION}ms`,
        animationIterationCount: 1,
        animationFillMode: 'forwards',
      },
    },
    '@keyframes feedbackYAxis': {
      '0%': {
        opacity: 1,
      },
      '100%': {
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
