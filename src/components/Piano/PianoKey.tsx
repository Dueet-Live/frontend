import React, { useState } from 'react';
import * as Tone from 'tone';
import {
  calculateBlackKeyHeight,
  calculateBlackKeyWidth,
} from '../../utils/calculateKeyboardDimension';
import isAccidentalNote from './utils/isAccidentalNote';
import AccidentalKey from './AccidentalKey';
import NaturalKey from './NaturalKey';
import { PlayingNote } from '../../types/PlayingNote';

type Props = {
  note: number;
  keyWidth: number;
  keyHeight: number;
  playingNote: PlayingNote[];
  startPlayingNote: () => void;
  stopPlayingNote: () => void;
  keyboardShortcut: string[];
  useTouchEvents: boolean;
};

const PianoKey: React.FC<Props> = ({
  note,
  keyWidth,
  keyHeight,
  playingNote,
  startPlayingNote,
  stopPlayingNote,
  keyboardShortcut,
  useTouchEvents: useTouchscreen,
}) => {
  const [useTouchEvents, setUseTouchEvents] = useState(useTouchscreen);

  const handleMouseDown = (event: MouseEvent) => {
    // console.log(`Mouse down ${note}`);
    event.preventDefault();
    event.stopPropagation();
    startPlayingNote();
  };

  const handleMouseUp = (event: MouseEvent) => {
    // console.log(`Mouse up ${note}`);
    event.stopPropagation();
    stopPlayingNote();
  };

  const handleMouseEnter = (event: MouseEvent) => {
    event.stopPropagation();
    if (event.buttons) {
      // console.log(`Mouse enter ${note}`);
      startPlayingNote();
    }
  };

  const handleMouseLeave = (event: MouseEvent) => {
    event.stopPropagation();
    if (event.buttons) {
      // console.log(`Mouse leave ${note}`);
      stopPlayingNote();
    }
  };

  // Event bubbling starts from here (bubble touch event to parent)
  const handleTouchStart = () => {
    // console.log(`(Child) Touch start ${note}`);
    setUseTouchEvents(true);
  };

  const eventHandlers = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
  };

  const isNoteAccidental = isAccidentalNote(note);
  const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;
  const getBottomText = () => {
    if (keyboardShortcut.length === 0) {
      return '';
    } else {
      // If there are multiple shortcuts, display the first shortcut only
      return keyboardShortcut[0];
    }
  };

  return (
    <KeyComponent
      note={note}
      playingNote={playingNote}
      topText={note % 12 === 0 ? Tone.Frequency(note, 'midi').toNote() : ''}
      bottomText={getBottomText()}
      keyWidth={isNoteAccidental ? calculateBlackKeyWidth(keyWidth) : keyWidth}
      keyHeight={
        isNoteAccidental ? calculateBlackKeyHeight(keyHeight) : keyHeight
      }
      eventHandlers={!useTouchEvents ? eventHandlers : {}}
    />
  );
};

export default PianoKey;
