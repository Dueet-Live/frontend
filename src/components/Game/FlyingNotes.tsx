import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    // FIXME: HACK
    // This is with respect to the app bar dimensions
    height: '400%',
    width: '40px',
  },
});

// https://github.com/mui-org/material-ui/issues/13793
const useAnimationStyles = ({
  startX,
  deltaX,
  startY,
  deltaY,
  animationDuration,
  isMe,
  symbol,
}: {
  // percent of parent container width
  startX: number;
  deltaX: number;
  // percent of note height
  startY: number;
  deltaY: number;
  animationDuration: number;
  isMe: boolean;
  symbol: string;
}) => {
  return makeStyles(theme => ({
    // Make object move in a curved path
    // https://tobiasahlin.com/blog/curved-path-animations-in-css
    note: {
      position: 'relative',
      animationName: '$musicXAxis',
      animationTimingFunction: 'ease-out',
      animationDuration: `${animationDuration}ms`,
      animationIterationCount: 1,
      animationFillMode: 'forwards',
      '&:after': {
        content: `"${symbol}"`,
        fontSize: theme.typography.h5.fontSize,
        color: isMe ? theme.palette.me.main : theme.palette.friend.main,
        position: 'absolute',
        animationName: '$musicYAxis',
        animationTimingFunction: 'ease-in',
        animationDuration: `${animationDuration}ms`,
        animationIterationCount: 1,
        animationFillMode: 'forwards',
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
        opacity: 1,
      },
      '100%': {
        transform: `translateY(${startY + deltaY}%)`,
        opacity: 0,
      },
    },
  }))();
};

type Note = { id: string; animationDuration: number };

const musicSymbols = ['♩', '♪', '♫', '♬', '♭', '♯'];

// False positive: https://github.com/yannickcr/eslint-plugin-react/issues/2133
// eslint-disable-next-line react/display-name
const FlyingNote = React.memo(
  ({
    animationDuration,
    isMe,
  }: {
    animationDuration: number;
    isMe: boolean;
  }) => {
    const symbol =
      musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
    const classes = useAnimationStyles({
      startX: 0,
      deltaX: 0,
      startY: 0,
      deltaY: 500,
      animationDuration,
      isMe,
      symbol,
    });
    return <div className={classes.note}></div>;
  },
  // Never re-render
  () => true
);

const generateRandomNote = (): Note => {
  return {
    id: uuid(),
    animationDuration: 2000,
  };
};

export type FlyingNotesHandle = {
  addNote: () => void;
};
export type FlyingNotesHandleRef = React.MutableRefObject<FlyingNotesHandle | null>;

export const FlyingNotes: React.FC<{
  handleRef: FlyingNotesHandleRef;
  isMe: boolean;
}> = ({ handleRef, isMe }) => {
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
    const newNote = generateRandomNote();
    setNotes(oldNotes => {
      const newNotes = new Set(oldNotes);
      newNotes.add(newNote);
      return newNotes;
    });
    setTimeout(() => {
      removeNote(newNote);
    }, newNote.animationDuration);
  };

  handleRef.current = {
    addNote,
  };

  return (
    <div className={classes.container}>
      {Array.from(notes).map(note => (
        <FlyingNote
          isMe={isMe}
          animationDuration={note.animationDuration}
          key={note.id}
        />
      ))}
    </div>
  );
};
