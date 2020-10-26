import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { PlayerContext } from '../../../contexts/PlayerContext';
import { shortcutsForSmartPiano } from '../../../utils/getKeyboardShorcutsMapping';
import {
  addNotePlayListener,
  playNote,
  removeNotePlayListener,
  stopNote,
} from '../../../utils/socket';
import InstrumentPlayer from '../InstrumentPlayer';
import { PlayingNote } from '../types/playingNote';
import isRegularKey from '../utils/isRegularKey';
import { default as SmartPianoKey } from './SmartPianoKey';
import './SmartPiano.css';

type Props = {
  instrumentPlayer: InstrumentPlayer;
  keyWidth: number;
  keyHeight: number;
  smartMapping: number[];
  didPlayNote?: (key: number, playerId: number) => void;
  didStopNote?: (key: number, playerId: number) => void;
  keyboardMap?: { [key: string]: number };
};

const SmartPiano: React.FC<Props> = ({
  instrumentPlayer,
  keyWidth,
  keyHeight,
  smartMapping,
  didPlayNote = noOp,
  didStopNote = noOp,
  keyboardMap,
}) => {
  const prevMappingRef = useRef<number[]>([]);
  const numOfSmartKeys = 7;
  const { me, friend } = useContext(PlayerContext);
  const isDuetMode = friend !== null;
  const [playingNotes, setPlayingNotes] = useState<PlayingNote[]>([]);

  // Used for touchscreen input
  const [useTouchEvents, setUseTouchEvents] = useState(false);
  const [touchedIndexes, setTouchedIndexes] = useState(new Set<number>());

  const startPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        playNote(note);
      }

      instrumentPlayer.playNote(note);

      // Trigger callback
      didPlayNote(note, playerId);
    },
    [isDuetMode, me, didPlayNote, instrumentPlayer]
  );

  const stopPlayingNote = useCallback(
    (note: number, playerId: number) => {
      // Relay to server
      if (isDuetMode && playerId === me) {
        stopNote(note);
      }

      instrumentPlayer.stopNote(note);

      // Trigger callback
      didStopNote(note, playerId);
    },
    [isDuetMode, me, didStopNote, instrumentPlayer]
  );

  const getIndexFromNote = (note: number, mapping: number[]) => {
    return mapping.indexOf(note);
  };

  useEffect(() => {
    const prevMapping = prevMappingRef.current;
    if (playingNotes.length !== 0) {
      setPlayingNotes(playingNotes => {
        return playingNotes.filter(playingNote => {
          const prevNote = playingNote.note;
          const prevIndex = getIndexFromNote(prevNote, prevMapping);
          // Not present in previous mapping, newly tapped notes
          if (prevIndex === -1) {
            return true;
          }
          const currentNote = smartMapping[prevIndex];
          if (currentNote !== prevNote) {
            stopPlayingNote(prevNote, me);
            return false;
          }
          return true;
        });
      });
    }

    prevMappingRef.current = smartMapping;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartMapping, me, stopPlayingNote]);

  const startPlayingSmartKey = useCallback(
    (index: number, playerId: number) => {
      const note = smartMapping[index];

      // Stop previous note at this index (if any)
      playingNotes.forEach(playingNote => {
        if (playingNote.smartKey === index && playingNote.note !== note) {
          stopPlayingNote(playingNote.note, playerId);
        }
      });

      startPlayingNote(note, playerId);
      setPlayingNotes(playingNotes => {
        const filtered = playingNotes.filter(
          playingNote => playingNote.smartKey !== index
        );
        return [...filtered, { note, playerId, smartKey: index }];
      });
    },
    [startPlayingNote, stopPlayingNote, smartMapping, playingNotes]
  );

  const stopPlayingSmartKey = useCallback(
    (index: number, playerId: number) => {
      const note = smartMapping[index];
      stopPlayingNote(note, playerId);

      setPlayingNotes(playingNotes => {
        return playingNotes.filter(
          playingNote =>
            playingNote.note !== note || playingNote.playerId !== playerId
        );
      });
    },
    [stopPlayingNote, smartMapping]
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
      `(Parent) Touch start ${Array.from(touchedIndexes.toString())}`
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
        .map((_, index) => index)
        .map(index => {
          const note = smartMapping[index];
          return (
            <SmartPianoKey
              useTouchEvents={useTouchEvents}
              index={index}
              key={index}
              note={note}
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

export default SmartPiano;
