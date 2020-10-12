import React, { useContext, useEffect, useState } from 'react';
import PianoKey from './PianoKey';
import { PlayerContext } from '../PlayerContext';
import getNotesBetween from './utils/getNotesBetween';
import getKeyboardShortcutForNote from './utils/getKeyboardShortcutsForNote';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { calculateKeyHeight } from '../../utils/calculateKeyboardDimension';
import '../InteractivePiano.css';
import { PlayingNote } from '../../types/PlayingNote';
import InstrumentAudio from './InstrumentAudio';
import { addNotePlayListener } from '../../utils/socket';

type Props = {
  startNote: number;
  endNote: number;
  keyWidth: number;
  keyboardMap: { [key: string]: number };
  didPlayNote: (note: number, playerId: number) => void;
  didStopNote: (note: number, playerId: number) => void;
};

function isRegularKey(event: KeyboardEvent) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

const Piano: React.FC<Props> = ({
  startNote,
  endNote,
  keyWidth,
  keyboardMap,
  didPlayNote,
  didStopNote,
}) => {
  const { height } = useWindowDimensions();
  const keyHeight = calculateKeyHeight(height);
  const notes = getNotesBetween(startNote, endNote);
  const { me, friend } = useContext(PlayerContext);
  const [playingNotes, setPlayingNotes] = useState<PlayingNote[]>([]);

  // Handle touchscreen input
  const [useTouchEvents, setUseTouchEvents] = useState(false);
  const [touchedNotes, setTouchedNotes] = useState(new Set<number>());

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    addNotePlayListener(handleNotePlayByFriend, handleNoteStopByFriend);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Handle state change */
  const startPlayingNote = (note: number, playerId: number) => {
    didPlayNote(note, playerId);
    setPlayingNotes(playingNotes => {
      return [...playingNotes, { note, playerId }];
    });
  };

  const stopPlayingNote = (note: number, playerId: number) => {
    didStopNote(note, playerId);
    setPlayingNotes(playingNotes => {
      return playingNotes.filter(
        notePlaying =>
          notePlaying.note !== note || notePlaying.playerId !== playerId
      );
    });
  };

  /* Handle friends' notes */
  const handleNotePlayByFriend = (note: number) => {
    if (friend) {
      startPlayingNote(note, friend);
    }
  };

  const handleNoteStopByFriend = (note: number) => {
    if (friend) {
      stopPlayingNote(note, friend);
    }
  };

  /* Handle keyboard input */
  const getNoteFromKeyboardKey = (keyboardKey: string) => {
    return keyboardMap[keyboardKey.toUpperCase()];
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isRegularKey(event) && !event.repeat) {
      const note = getNoteFromKeyboardKey(event.key);
      if (note) {
        startPlayingNote(note, me);
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (isRegularKey(event)) {
      const note = getNoteFromKeyboardKey(event.key);
      if (note) {
        stopPlayingNote(note, me);
      }
    }
  };

  /* Handle touchscreen input */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setUseTouchEvents(true);
    setTouchedNotes(getTouchedNotes(event.touches));
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
  };

  const handleTouchCancel = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedNotes(getTouchedNotes(event.touches));
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
