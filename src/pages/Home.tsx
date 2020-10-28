import { makeStyles } from '@material-ui/core';
import React, { useRef } from 'react';
import {
  FeedbackNotes,
  FeedbackNotesHandle,
} from '../components/Game/FeedbackNotes';

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
  const feedbackNotesRef = useRef<FeedbackNotesHandle>(null);
  return (
    <>
      <button onClick={() => feedbackNotesRef.current?.addNote()}>
        Add Note
      </button>
      <FeedbackNotes handleRef={feedbackNotesRef} />;
    </>
  );
};

export default Home;
