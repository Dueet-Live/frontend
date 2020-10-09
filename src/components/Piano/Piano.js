import React from 'react';
import Instrument from './Instrument';
import PianoKey from './PianoKey';

import getNotesBetween from './utils/getNotesBetween';
import getKeyboardShortcutForNote from './utils/getKeyboardShortcutsForNote';

// type Props = {
//   startNote: number
//   endNote: number,
//   keyWidth: number,
//   keyboardMap: { [key: string]: number }
//   handleKeyUp: (note: number) => void
//   handleKeyDown: (note: number) => void
// }

const Piano = ({
  startNote,
  endNote,
  keyWidth,
  keyboardMap,
  didPlayNote,
  didStopNote,
}) => {
  const notes = getNotesBetween(startNote, endNote);

  return (
    <Instrument
      instrument={'acoustic_grand_piano'}
      keyboardMap={keyboardMap}
      didPlayNote={didPlayNote}
      didStopNote={didStopNote}
      renderInstrument={({ notesPlaying, onPlayNoteStart, onPlayNoteEnd }) =>
        notes.map(note => (
          <PianoKey
            key={note}
            note={note}
            keyWidth={keyWidth}
            playingNote={notesPlaying.filter(
              notePlaying => notePlaying.note === note
            )}
            startPlayingNote={() => {
              // TODO: replace with current player id
              onPlayNoteStart(note, -1);
            }}
            stopPlayingNote={() => {
              // TODO: replace with current player id
              onPlayNoteEnd(note, -1);
            }}
            keyboardShortcut={getKeyboardShortcutForNote(keyboardMap, note)}
          />
        ))
      }
    />
  );
};

export default Piano;
