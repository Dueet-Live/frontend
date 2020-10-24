import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { PlayingNote } from '../../types/PlayingNote';
import { getKeyboardShortcutForNote } from '../../utils/getKeyboardShorcutsMapping';
import {
  addNotePlayListener,
  playNote,
  removeNotePlayListener,
  stopNote,
} from '../../utils/socket';
import './InteractivePiano.css';
import InstrumentAudio from './InstrumentAudio';
import PianoKey from './PianoKey';
import getNotesBetween from './utils/getNotesBetween';
import { noOp } from 'tone/build/esm/core/util/Interface';

type Props = {
  startNote: number;
  endNote: number;
  keyWidth: number;
  keyHeight: number;
  keyboardMap: { [key: string]: number };
  didPlayNote?: (note: number, playerId: number) => void;
  didStopNote?: (note: number, playerId: number) => void;
};

function isRegularKey(event: KeyboardEvent) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

const Piano: React.FC<Props> = ({
  startNote,
  endNote,
  keyWidth,
  keyHeight,
  keyboardMap,
  didPlayNote = noOp,
  didStopNote = noOp,
}) => {
  const notes = getNotesBetween(startNote, endNote);
  const { me, friend } = useContext(PlayerContext);
  const isDuetMode = friend !== null;
  const [playingNotes, setPlayingNotes] = useState<PlayingNote[]>([]);

  // Used for touchscreen input
  const [useTouchEvents, setUseTouchEvents] = useState(false);
  const [touchedNotes, setTouchedNotes] = useState(new Set<number>());

  /* Handle state change */
  const startPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        playNote(note);
      }

      setPlayingNotes(playingNotes => {
        return [...playingNotes, { note, playerId }];
      });

      // Trigger callback
      didPlayNote(note, playerId);
    },
    [isDuetMode, me, didPlayNote]
  );

  const stopPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        stopNote(note);
      }

      setPlayingNotes(playingNotes => {
        return playingNotes.filter(
          notePlaying =>
            notePlaying.note !== note || notePlaying.playerId !== playerId
        );
      });

      // Trigger callback
      didStopNote(note, playerId);
    },
    [isDuetMode, me, didStopNote]
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
    console.log(`(Parent) Mouch start ${Array.from(touchedNotes.toString())}`);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Mouch end ${Array.from(touchedNotes).toString()}`);
  };

  const handleTouchCancel = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Mouch cancel ${Array.from(touchedNotes).toString()}`);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
    console.log(`(Parent) Mouch move ${Array.from(touchedNotes).toString()}`);
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
      className="interactive-piano__keyboard-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
    >
      {notes.map(note => (
        <PianoKey
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
      <InstrumentAudio
        notes={playingNotes.map(playingNote => playingNote.note.toString())}
        instrument={'acoustic_grand_piano'}
      />
    </div>
  );
};

export default Piano;
