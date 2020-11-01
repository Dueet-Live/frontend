import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

const ANIMATION_DURATION = 2000;

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    height: `calc(var(--vh, 1vh) * 15)`,
    width: '100%',
  },
});

// https://github.com/mui-org/material-ui/issues/13793
const useAnimationStyles = ({
  isMe,
  symbol,
}: {
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
      animationDuration: `${ANIMATION_DURATION}ms`,
      animationIterationCount: 1,
      animationFillMode: 'forwards',
      '&:after': {
        content: `"${symbol}"`,
        [theme.breakpoints.down('sm')]: {
          fontSize: theme.typography.body2.fontSize,
        },
        [theme.breakpoints.up('md')]: {
          fontSize: theme.typography.h4.fontSize,
        },
        color: isMe ? theme.palette.me.main : theme.palette.friend.main,
        position: 'absolute',
        animationName: '$musicYAxis',
        animationTimingFunction: 'ease-in',
        animationDuration: `${ANIMATION_DURATION}ms`,
        animationIterationCount: 1,
        animationFillMode: 'forwards',
      },
    },
    '@keyframes musicXAxis': {
      '0%': {
        transform: `translateX(0)`,
      },
      '100%': {
        transform: `translateX(calc(var(--vh, 1vh) * 0))`,
      },
    },
    '@keyframes musicYAxis': {
      '0%': {
        transform: `translateY(0)`,
        opacity: 1,
      },
      '100%': {
        transform: `translateY(calc(var(--vh, 1vh) * 10))`,
        opacity: 0,
      },
    },
  }))();
};

type Note = { id: string };

const musicSymbols = ['♩', '♪', '♫', '♬', '♭', '♯'];

// False positive: https://github.com/yannickcr/eslint-plugin-react/issues/2133
// eslint-disable-next-line react/display-name
const FlyingNote = React.memo(
  ({ isMe }: { isMe: boolean }) => {
    const symbol =
      musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
    const classes = useAnimationStyles({
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
    }, ANIMATION_DURATION);
  };

  handleRef.current = {
    addNote,
  };

  return (
    <div className={classes.container}>
      {Array.from(notes).map(note => (
        <FlyingNote isMe={isMe} key={note.id} />
      ))}
    </div>
  );
};
