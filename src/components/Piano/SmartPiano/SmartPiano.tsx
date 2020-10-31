import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PlayerContext } from '../../../contexts/PlayerContext';
import { shortcutsForSmartPiano } from '../../../utils/getKeyboardShorcutsMapping';
import {
  addNotePlayListener,
  playNote,
  removeNotePlayListener,
  stopNote,
} from '../../../utils/socket';
import { PlayingNote } from '../types/playingNote';
import isRegularKey from '../utils/isRegularKey';
import './SmartPiano.css';
import { MappedNote } from '../types/mappedNote';
import { NotesManager } from './NotesManager';
import * as Tone from 'tone';
import SmartPianoKeyWithFeedback from './SmartPianoKeyWithFeedback';
import { GameContext } from '../../../contexts/GameContext';

type Props = {
  keyWidth: number;
  keyHeight: number;
  indexToNotesMap: MappedNote[][];
  keyboardMap?: { [key: string]: number };
  startTime: number;
};

const SmartPiano: React.FC<Props> = ({
  keyWidth,
  keyHeight,
  indexToNotesMap, // Unchanged
  keyboardMap, // Unchanged
  startTime,
}) => {
  const numOfSmartKeys = 7;
  const { me, friend } = useContext(PlayerContext);
  const isDuetMode = friend !== null;
  const notesManagersRef = useRef(
    indexToNotesMap.map(indexToNotes => new NotesManager(indexToNotes))
  );
  // Only consist of my notes
  const [playingNotes, setPlayingNotes] = useState<PlayingNote[]>([]);

  // Used for touchscreen input
  const [useTouchEvents, setUseTouchEvents] = useState(false);
  const [touchedIndexes, setTouchedIndexes] = useState(new Set<number>());

  // Used for note feedback
  const { gameManagerRef, instrumentPlayer } = useContext(GameContext);
  const feedbackManager = gameManagerRef?.current.feedbackManager;

  const startPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        playNote(note);
      }

      instrumentPlayer.playNote(note);

      // Trigger callback
      gameManagerRef?.current.handleNotePlay(note, playerId, me);
    },
    [isDuetMode, me, instrumentPlayer, gameManagerRef]
  );

  const stopPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        stopNote(note);
      }

      instrumentPlayer.stopNote(note);

      // Trigger callback
      gameManagerRef?.current.handleNoteStop(note, playerId, me);
    },
    [isDuetMode, me, instrumentPlayer, gameManagerRef]
  );

  const startPlayingSmartKey = useCallback(
    (index: number, playerId: number) => {
      // update mapping before getting note
      const timeElapsed = Tone.now() - startTime;
      notesManagersRef.current[index].manage(timeElapsed);

      // get note
      const note = notesManagersRef.current[index].firstNote;

      startPlayingNote(note.midi, playerId);
      feedbackManager?.didPlayNote(note.midi, index);

      // Update state
      setPlayingNotes(playingNotes => {
        const filtered = playingNotes.filter(
          playingNote => playingNote.smartKey !== index
        );
        return [
          ...filtered,
          {
            note: note.midi,
            playerId: playerId,
            smartKey: index,
          } as PlayingNote,
        ];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startPlayingNote, startTime, feedbackManager]
  );

  const stopPlayingSmartKey = useCallback(
    (index: number, playerId: number) => {
      const note = notesManagersRef.current[index].firstNote;

      stopPlayingNote(note.midi, playerId);
      feedbackManager?.didStopNote(note.midi, index);

      // Update state
      setPlayingNotes(playingNotes => {
        return playingNotes.filter(
          playingNote =>
            playingNote.note !== note.midi || playingNote.playerId !== playerId
        );
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stopPlayingNote, startTime, feedbackManager]
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

  useEffect(() => {
    addNotePlayListener(handleNotePlayByFriend, handleNoteStopByFriend);

    return () => {
      removeNotePlayListener();
    };
  }, [handleNotePlayByFriend, handleNoteStopByFriend]);

  /* Handle keyboard input */
  const getIndexFromKeyboardKey = useCallback(
    (keyboardKey: string) => {
      return keyboardMap && keyboardMap[keyboardKey.toUpperCase()];
    },
    [keyboardMap]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isRegularKey(event) && !event.repeat) {
        const index = getIndexFromKeyboardKey(event.key);
        if (index !== undefined) {
          startPlayingSmartKey(index, me);
        }
      }
    },
    [me, startPlayingSmartKey, getIndexFromKeyboardKey]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (isRegularKey(event)) {
        const index = getIndexFromKeyboardKey(event.key);
        if (index !== undefined) {
          stopPlayingSmartKey(index, me);
        }
      }
    },
    [me, stopPlayingSmartKey, getIndexFromKeyboardKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp, handleKeyDown]);

  /* Handle touchscreen input */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setUseTouchEvents(true);
    setTouchedIndexes(getTouchedIndexes(event.touches));
    console.log(
      `(Parent) Touch start ${Array.from(touchedIndexes).toString()}`
    );
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedIndexes(getTouchedIndexes(event.touches));
    console.log(`(Parent) Touch end ${Array.from(touchedIndexes).toString()}`);
  };

  const handleTouchCancel = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedIndexes(getTouchedIndexes(event.touches));
    console.log(
      `(Parent) Touch cancel ${Array.from(touchedIndexes).toString()}`
    );
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setTouchedIndexes(getTouchedIndexes(event.touches));
    console.log(`(Parent) Touch move ${Array.from(touchedIndexes).toString()}`);
  };

  const getTouchedIndexes = (touches: React.TouchList) => {
    const currTouchedIndexes = new Set<number>();
    for (let i = 0; i < touches.length; i++) {
      const touchedElement = document.elementFromPoint(
        touches[i].pageX,
        touches[i].pageY
      );
      const index = touchedElement?.getAttribute('data-index');
      if (index) {
        currTouchedIndexes.add(parseInt(index));
      }
    }

    const newActiveIndexes = Array.from(currTouchedIndexes).filter(
      currIndex => !touchedIndexes.has(currIndex)
    );
    const newInactiveIndexes = Array.from(touchedIndexes).filter(
      currIndex => !currTouchedIndexes.has(currIndex)
    );

    newActiveIndexes.forEach(index => {
      startPlayingSmartKey(index, me);
    });

    newInactiveIndexes.forEach(index => {
      stopPlayingSmartKey(index, me);
    });

    return currTouchedIndexes;
  };

  return (
    <div
      className="smart-piano__keyboard-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
    >
      {Array(numOfSmartKeys)
        .fill(0)
        .map((_, index) => {
          return (
            <SmartPianoKeyWithFeedback
              useTouchEvents={useTouchEvents}
              index={index}
              key={index}
              keyWidth={keyWidth}
              keyHeight={keyHeight}
              playingNote={playingNotes.filter(
                playingNote => playingNote.smartKey === index
              )}
              startPlayingNote={() => {
                startPlayingSmartKey(index, me);
              }}
              stopPlayingNote={() => {
                stopPlayingSmartKey(index, me);
              }}
              keyboardShortcut={
                keyboardMap !== undefined ? shortcutsForSmartPiano[index] : []
              }
            />
          );
        })}
    </div>
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyWidth === nextProps.keyWidth &&
    prevProps.keyHeight === nextProps.keyHeight &&
    prevProps.startTime === nextProps.startTime
  );
}

export default React.memo(SmartPiano, areEqual);
