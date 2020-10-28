import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

const useStyles = makeStyles({
  container: {
    height: '100%',
  },
});

// https://github.com/mui-org/material-ui/issues/13793
const useAnimationStyles = ({
  startY,
  deltaY,
  startX,
  deltaX,
  animationDuration,
}: {
  startY: number;
  deltaY: number;
  startX: number;
  deltaX: number;
  animationDuration: number;
}) => {
  return makeStyles({
    note: {
      position: 'relative',
      top: '50%',
      animation: `$musicXAxis ${animationDuration}ms infinite ease-out`,
      '&:after': {
        content: '"🎵"',
        position: 'absolute',
        animation: `$musicYAxis ${animationDuration}ms infinite ease-in`,
      },
    },
    '@keyframes musicXAxis': {
      '0%': {
        transform: `translateX(${startX}%)`,
      },
      '100%': {
        transform: `translateX(${startX + deltaX}%)`,
      },
    },
    '@keyframes musicYAxis': {
      '0%': {
        transform: `translateY(${startY}%)`,
      },
      '100%': {
        transform: `translateY(${startY + deltaY}%)`,
      },
    },
  })();
};

type Note = { id: string; startY: number; animationDuration: number };

// eslint-disable-next-line react/display-name
const FeedbackNote = React.memo(
  ({ startY, animationDuration }: Note) => {
    const classes = useAnimationStyles({
      startX: 0,
      // 10% of parent container
      deltaX: 10,
      startY,
      // 1000% of note height
      deltaY: -1000,
      animationDuration,
    });
    return <div className={classes.note}></div>;
  },
  // Never re-render
  () => true
);

const generateRandomNote = (): Note => {
  return {
    id: uuid(),
    startY: Math.random() * 500 - 250,
    animationDuration: 2000,
  };
};

export type FeedbackNotesHandle = {
  addNote: () => void;
};
export type FeedbackNotesRef = React.MutableRefObject<FeedbackNotesHandle | null>;

export const FeedbackNotes: React.FC<{ handleRef: FeedbackNotesRef }> = ({
  handleRef,
}) => {
  const classes = useStyles();
  const [notes, setNotes] = useState<Set<Note>>(new Set());

  const removeNote = (note: Note) => {
    setNotes(oldNotes => {
      const newNotes = new Set(oldNotes);
      newNotes.delete(note);
      return newNotes;
    });
  };

  const addNote = () => {
    setNotes(notes => {
      const newNotes = new Set(notes);
      const newNote = generateRandomNote();
      newNotes.add(newNote);
      setTimeout(() => removeNote(newNote), newNote.animationDuration);
      return newNotes;
    });
  };

  handleRef.current = { addNote };

  return (
    <div className={classes.container}>
      {Array.from(notes).map(note => (
        <FeedbackNote {...note} key={note.id} />
      ))}
    </div>
  );
};
