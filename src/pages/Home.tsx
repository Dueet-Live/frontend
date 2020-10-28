import { makeStyles } from '@material-ui/core';
import React from 'react';
import { FeedbackNotes } from '../components/Game/NoteFeedback';

const useStyles = makeStyles(theme => ({
  outer: {
    height: '100%',
  },
  inner: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  subtext: {
    maxWidth: '75%',
  },
  button: {
    width: '148px',
  },
  icon: {
    fontSize: theme.typography.h3.fontSize,
  },
}));

const Home: React.FC = () => {
  return <FeedbackNotes />;
};

export default Home;
