import React, { useContext } from 'react';
import Instrument from './Instrument';
import PianoKey from './PianoKey';
import { PlayerContext } from '../PlayerContext';
import getNotesBetween from './utils/getNotesBetween';
import getKeyboardShortcutForNote from './utils/getKeyboardShortcutsForNote';

// type Props = {
//   startNote: number
//   endNote: number,
//   keyWidth: number,
//   keyboardMap: { [key: string]: number }
//   didPlayNote: (note: number, playerId: number) => void
//   didStopNote: (note: number, playerId: number) => void
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
  const { me } = useContext(PlayerContext);

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
              onPlayNoteStart(note, me);
            }}
            stopPlayingNote={() => {
              onPlayNoteEnd(note, me);
            }}
            keyboardShortcut={getKeyboardShortcutForNote(keyboardMap, note)}
          />
        ))
      }
    />
  );
};

export default Piano;
