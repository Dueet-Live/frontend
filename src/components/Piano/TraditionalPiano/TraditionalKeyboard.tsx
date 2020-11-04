import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../../../contexts/PlayerContext';
import { PlayingNote } from '../types/playingNote';
import { getKeyboardShortcutForNote } from '../../../utils/getKeyboardShorcutsMapping';
import {
  addNotePlayListener,
  playNote,
  removeNotePlayListener,
  stopNote,
} from '../../../utils/socket';
import './TraditionalPiano.css';
import getNotesBetween from '../utils/getNotesBetween';
import isRegularKey from '../utils/isRegularKey';
import TraditionalPianoKey from './TraditionalPianoKey';
import { GameContext } from '../../../contexts/GameContext';

type Props = {
  startNote: number;
  endNote: number;
  keyWidth: number;
  keyHeight: number;
  keyboardMap: { [key: string]: number };
};

const TraditionalKeyboard: React.FC<Props> = ({
  startNote,
  endNote,
  keyWidth,
  keyHeight,
  keyboardMap,
}) => {
  const notes = getNotesBetween(startNote, endNote);
  const { me, friend } = useContext(PlayerContext);
  const isDuetMode = friend !== null;
  // Consist of both my notes and my friend's notes
  const [playingNotes, setPlayingNotes] = useState<PlayingNote[]>([]);

  // Used for touchscreen input
  const [useTouchEvents, setUseTouchEvents] = useState(false);
  const [touchedNotes, setTouchedNotes] = useState(new Set<number>());

  // Used for note feedback
  const { gameManagerRef, instrumentPlayer } = useContext(GameContext);
  const feedbackManager = gameManagerRef?.current.feedbackManager;

  /* Handle state change */
  const startPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        playNote(note);
      }

      instrumentPlayer.playNote(note);

      if (playerId === me) {
        feedbackManager?.didPlayNote(note, note);
      }

      setPlayingNotes(playingNotes => {
        return [...playingNotes, { note, playerId }];
      });

      // Trigger callback
      gameManagerRef?.current.handleNotePlay(note, playerId, me);
    },
    [isDuetMode, me, gameManagerRef, instrumentPlayer, feedbackManager]
  );

  const stopPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        stopNote(note);
      }

      instrumentPlayer.stopNote(note);

      if (playerId === me) {
        feedbackManager?.didStopNote(note, note);
      }

      setPlayingNotes(playingNotes => {
        return playingNotes.filter(
          notePlaying =>
            notePlaying.note !== note || notePlaying.playerId !== playerId
        );
      });

      // Trigger callback
      gameManagerRef?.current.handleNoteStop(note, playerId, me);
    },
    [isDuetMode, me, gameManagerRef, instrumentPlayer, feedbackManager]
  );

  /* Handle friends' notes */
  const handleNotePlayByFriend = useCallback(
    (note: number) => {
      if (friend !== null) {
        startPlayingNote(note, friend);
      }
    },
    [friend, startPlayingNote]
  );

  const handleNoteStopByFriend = useCallback(
    (note: number) => {
      if (friend !== null) {
        stopPlayingNote(note, friend);
      }
    },
    [friend, stopPlayingNote]
  );

  /* Handle keyboard input */
  const getNoteFromKeyboardKey = useCallback(
    (keyboardKey: string) => {
      return keyboardMap[keyboardKey.toUpperCase()];
    },
    [keyboardMap]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isRegularKey(event) && !event.repeat) {
        const note = getNoteFromKeyboardKey(event.key);
        if (note) {
          startPlayingNote(note, me);
        }
      }
    },
    [me, startPlayingNote, getNoteFromKeyboardKey]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (isRegularKey(event)) {
        const note = getNoteFromKeyboardKey(event.key);
        if (note) {
          stopPlayingNote(note, me);
        }
      }
    },
    [me, stopPlayingNote, getNoteFromKeyboardKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    addNotePlayListener(handleNotePlayByFriend, handleNoteStopByFriend);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      removeNotePlayListener();
    };
  }, [
    handleKeyUp,
    handleKeyDown,
    handleNotePlayByFriend,
    handleNoteStopByFriend,
  ]);

  /* Handle touchscreen input */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setUseTouchEvents(true);
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Touch start ${Array.from(touchedNotes).toString()}`);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Touch end ${Array.from(touchedNotes).toString()}`);
  };

  const handleTouchCancel = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Touch cancel ${Array.from(touchedNotes).toString()}`);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Touch move ${Array.from(touchedNotes).toString()}`);
  };

  const getTouchedNotes = (touches: React.TouchList) => {
    const currTouchedNotes = new Set<number>();
    for (let i = 0; i < touches.length; i++) {
      const touchedElement = document.elementFromPoint(
        touches[i].pageX,
        touches[i].pageY
      );
      const note = touchedElement?.getAttribute('data-note');
      if (note) {
        currTouchedNotes.add(parseInt(note));
      }
    }

    const newActiveNotes = Array.from(currTouchedNotes).filter(
      currNote => !touchedNotes.has(currNote)
    );
    const newInactiveNotes = Array.from(touchedNotes).filter(
      currNote => !currTouchedNotes.has(currNote)
    );

    newActiveNotes.forEach(note => {
      startPlayingNote(note, me);
    });

    newInactiveNotes.forEach(note => {
      stopPlayingNote(note, me);
    });

    return currTouchedNotes;
  };

  return (
    <div
      className="traditional-piano__keyboard-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
    >
      {notes.map(note => (
        <TraditionalPianoKey
          useTouchEvents={useTouchEvents}
          key={note}
          note={note}
          keyWidth={keyWidth}
          keyHeight={keyHeight}
          playingNote={playingNotes.filter(
            playingNote => playingNote.note === note
          )}
          startPlayingNote={() => {
            startPlayingNote(note, me);
          }}
          stopPlayingNote={() => {
            stopPlayingNote(note, me);
          }}
          keyboardShortcut={getKeyboardShortcutForNote(keyboardMap, note)}
        />
      ))}
    </div>
  );
};

export default TraditionalKeyboard;
