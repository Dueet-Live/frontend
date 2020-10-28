import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';

// https://github.com/mui-org/material-ui/issues/13793
const useAnimationStyles = (startingY: number) => {
  return makeStyles({
    note: {
      position: 'absolute',
      top: '50%',
      animation: '$musicXAxis 0.5s infinite ease-out',
      '&:after': {
        content: '"🎵"',
        position: 'absolute',
        animation: '$musicYAxis 0.5s infinite ease-in',
      },
    },
    '@keyframes musicXAxis': {
      '0%': {
        transform: 'translateX(0)',
      },
      '100%': {
        transform: 'translateX(50px)',
      },
    },
    '@keyframes musicYAxis': {
      '0%': {
        transform: `translateY(${startingY}px)`,
      },
      '100%': {
        transform: `translateY(${startingY - 100}px)`,
      },
    },
  })();
};

export const NoteFeedback: React.FC<{ startY: number }> = ({ startY }) => {
  console.log('re-rendered');
  const classes = useAnimationStyles(startY);
  const note = <div className={classes.note}></div>;
  return note;
};

export const FeedbackNotes: React.FC = () => {
  const [notes, setNotes] = useState<Set<number>>(new Set([-50, 0, 50, 100]));
  console.log(notes);
  const onClick = () => {
    setNotes(notes => {
      const newNotes = new Set(notes);
      notes.add(Math.random() * 200 - 100);
      return newNotes;
    });
  };

  return (
    <div>
      <button onClick={onClick}>Add</button>
      hello
      {notes.toString()}
      {Array.from(notes).map(note => (
        <NoteFeedback key={note} startY={note} />
      ))}
    </div>
  );
};
