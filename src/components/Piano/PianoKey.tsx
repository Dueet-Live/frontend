import React, { useState } from 'react';
import * as Tone from 'tone';
import { calculateBlackKeyWidth } from '../../utils/calculateKeyboardDimension';
import isAccidentalNote from './utils/isAccidentalNote';
import AccidentalKey from './AccidentalKey';
import NaturalKey from './NaturalKey';

type PlayingNote = {
  note: number;
  playerId: number;
};

type Props = {
  note: number;
  keyWidth: number;
  playingNote: PlayingNote[];
  startPlayingNote: () => void;
  stopPlayingNote: () => void;
  keyboardShortcut: string[];
};

const PianoKey: React.FC<Props> = ({
  note,
  keyWidth,
  playingNote,
  startPlayingNote,
  stopPlayingNote,
  keyboardShortcut,
}) => {
  const [useTouchEvents, setUseTouchEvents] = useState(false);

  const handleMouseDown = () => {
    console.log(`Mouse down ${note}`);
    startPlayingNote();
  };

  const handleMouseUp = () => {
    console.log(`Mouse up ${note}`);
    stopPlayingNote();
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.buttons) {
      console.log(`Mouse enter ${note}`);
      startPlayingNote();
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.buttons) {
      console.log(`Mouse leave ${note}`);
      stopPlayingNote();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    console.log(`Touch start ${note}`);
    setUseTouchEvents(true);
    startPlayingNote();
  };

  const handleTouchEnd = () => {
    console.log(`Touch end ${note}`);
    stopPlayingNote();
  };

  const handleTouchCancel = () => {
    console.log(`Touch cancel ${note}`);
    stopPlayingNote();
  };

  const eventHandlers = {
    onMouseDown: !useTouchEvents ? handleMouseDown : undefined,
    onMouseUp: !useTouchEvents ? handleMouseUp : undefined,
    onMouseEnter: !useTouchEvents ? handleMouseEnter : undefined,
    onMouseLeave: !useTouchEvents ? handleMouseLeave : undefined,
    onTouchStart: handleTouchStart,
    onTouchEnd: useTouchEvents ? handleTouchEnd : undefined,
    onTouchCancel: useTouchEvents ? handleTouchCancel : undefined,
  };

  const isNoteAccidental = isAccidentalNote(note);
  const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;

  return (
    <KeyComponent
      playingNote={playingNote}
      text={isNoteAccidental ? '' : Tone.Frequency(note, 'midi').toNote()}
      // Alternatively show keyboard shortcut
      // text={keyboardShortcuts.join(' / ')}
      keyWidth={isNoteAccidental ? calculateBlackKeyWidth(keyWidth) : keyWidth}
      eventHandlers={eventHandlers}
    />
  );
};

export default PianoKey;
