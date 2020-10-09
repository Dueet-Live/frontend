import React from 'react';
import * as Tone from 'tone';
import '../InteractivePiano.css';
import { calculateBlackKeyWidth } from '../../utils/calculateKeyboardDimension';
import isAccidentalNote from './utils/isAccidentalNote';

const AccidentalKey = ({ isPlaying, keyWidth, text, eventHandlers }) => {
  const getClassName = () => {
    if (isPlaying.length === 0) {
      return '';
    } else {
      // TODO: replace with user id
      if (isPlaying[0].player === -1) {
        return 'interactive-piano__accidental-key--playing-by-me';
      } else {
        return 'interactive-piano__accidental-key--playing-by-others';
      }
    }
  };

  return (
    <div className={'interactive-piano__accidental-key__wrapper'}>
      <button
        className={`interactive-piano__accidental-key ${getClassName()}`}
        {...eventHandlers}
        style={{ width: keyWidth }}
      >
        <div className={'interactive-piano__text'}>{text}</div>
      </button>
    </div>
  );
};

const NaturalKey = ({ isPlaying, keyWidth, text, eventHandlers }) => {
  const getClassName = () => {
    if (isPlaying.length === 0) {
      return '';
    } else {
      // TODO: replace with user id
      if (isPlaying[0].player === -1) {
        return 'interactive-piano__natural-key--playing-by-me';
      } else {
        return 'interactive-piano__natural-key--playing-by-others';
      }
    }
  };

  return (
    <button
      className={`interactive-piano__natural-key ${getClassName()}`}
      {...eventHandlers}
      style={{ width: keyWidth }}
    >
      <div className={'interactive-piano__text'}>{text}</div>
    </button>
  );
};

const PianoKey = ({
  note,
  keyWidth,
  isNotePlaying,
  startPlayingNote,
  stopPlayingNote,
  keyboardShortcut,
}) => {
  const handleMouseDown = () => {
    startPlayingNote();
  };

  const handleMouseUp = () => {
    stopPlayingNote();
  };

  const handleMouseEnter = event => {
    if (event.buttons) {
      startPlayingNote();
    }
  };

  const handleMouseLeave = event => {
    if (event.buttons) {
      stopPlayingNote();
    }
  };

  // TODO: mobile
  // const handleTouchStart = () => {
  //   console.log(`Touch start ${note}`)
  //   startPlayingNote();
  // }

  // const handleTouchEnd = () => {
  //   console.log(`Touch end ${note}`)
  //   stopPlayingNote();
  // }

  // const handleTouchCancel = () => {
  //   console.log(`Touch cancel ${note}`)
  //   stopPlayingNote();
  // }

  const eventHandlers = {
    // Desktop
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    // onTouchStart: onTouchStart,
    // onTouchEnd: onTouchEnd,
    // onTouchCancel: onTouchCancel
  };

  const isNoteAccidental = isAccidentalNote(note);
  const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;

  return (
    <KeyComponent
      isPlaying={isNotePlaying}
      text={isNoteAccidental ? '' : Tone.Frequency(note, 'midi').toNote()}
      keyWidth={isNoteAccidental ? calculateBlackKeyWidth(keyWidth) : keyWidth}
      // text={keyboardShortcuts.join(' / ')}
      eventHandlers={eventHandlers}
    />
  );
};

export default PianoKey;
