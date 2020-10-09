import React, { Fragment } from 'react';
import Instrument from './Instrument';
import PianoKey from './PianoKey';

import getNotesBetween from './utils/getNotesBetween';
import getKeyboardShortcutForNote from './utils/getKeyboardShortcutsForNote';

const Piano = ({
  startNote,
  endNote,
  keyWidth,
  keyboardMap,
  handleKeyUp,
  handleKeyDown,
}) => {
  const notes = getNotesBetween(startNote, endNote);

  return (
    <Instrument
      instrument={'acoustic_grand_piano'}
      keyboardMap={keyboardMap}
      renderInstrument={({ notesPlaying, onPlayNoteStart, onPlayNoteEnd }) =>
        notes.map(note => (
          <Fragment key={note}>
            <PianoKey
              note={note}
              keyWidth={keyWidth}
              isNotePlaying={notesPlaying.filter(
                notePlaying => notePlaying.note === note
              )}
              startPlayingNote={() => {
                // TODO: replace with user id
                onPlayNoteStart(note, -1);
                handleKeyDown(note);
              }}
              stopPlayingNote={() => {
                // TODO: replace with user id
                onPlayNoteEnd(note, -1);
                handleKeyUp(note);
              }}
              keyboardShortcut={getKeyboardShortcutForNote(keyboardMap, note)}
            />
          </Fragment>
        ))
      }
    />
  );
};

export default Piano;
