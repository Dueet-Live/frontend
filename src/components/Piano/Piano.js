import React, { Fragment } from 'react';
import Instrument from './Instrument';
import isAccidentalNote from './utils/isAccidentalNote';
import getNotesBetween from './utils/getNotesBetween';
import getKeyboardShortcutForNote from './utils/getKeyboardShortcutsForNote';

const Piano = ({
  startNote,
  endNote,
  keyWidth,
  keyboardMap,
  renderPianoKey,
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
            {renderPianoKey({
              note,
              keyWidth,
              isNoteAccidental: isAccidentalNote(note),
              isNotePlaying: notesPlaying.includes(note),
              startPlayingNote: () => {
                onPlayNoteStart(note);
                handleKeyDown(note);
              },
              stopPlayingNote: () => {
                onPlayNoteEnd(note);
                handleKeyUp(note);
              },
              keyboardShortcuts: getKeyboardShortcutForNote(keyboardMap, note),
            })}
          </Fragment>
        ))
      }
    />
  );
};

export default Piano;
