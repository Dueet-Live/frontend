import React from 'react';
import * as Tone from 'tone';
import '../InteractivePiano.css';

const AccidentalKey = ({ isPlaying, text, eventHandlers }) => {
  return (
    <div className={'interactive-piano__accidental-key__wrapper'}>
      <button
        className={`interactive-piano__accidental-key ${
          isPlaying ? 'interactive-piano__accidental-key--playing' : ''
        }`}
        {...eventHandlers}
      >
        <div className={'interactive-piano__text'}>{text}</div>
      </button>
    </div>
  );
};

const NaturalKey = ({ isPlaying, text, eventHandlers }) => {
  return (
    <button
      className={`interactive-piano__natural-key ${
        isPlaying ? 'interactive-piano__natural-key--playing' : ''
      }`}
      {...eventHandlers}
    >
      <div className={'interactive-piano__text'}>{text}</div>
    </button>
  );
};

const PianoKey = ({
  note,
  isNoteAccidental,
  isNotePlaying,
  startPlayingNote,
  stopPlayingNote,
  keyboardShortcuts,
}) => {
  const handleMouseDown = () => {
    console.log(`Mouse down ${note}`);
    startPlayingNote();
  };

  const handleMouseUp = () => {
    console.log(`Mouse up ${note}`);
    stopPlayingNote();
  };

  const handleMouseEnter = event => {
    if (event.buttons) {
      console.log(`Mouse enter ${note}`);
      startPlayingNote();
    }
  };

  const handleMouseLeave = event => {
    if (event.buttons) {
      console.log(`Mouse leave ${note}`);
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

  const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;

  return (
    <KeyComponent
      isPlaying={isNotePlaying}
      text={isNoteAccidental ? '' : Tone.Frequency(note, 'midi').toNote()}
      // text={keyboardShortcuts.join(' / ')}
      eventHandlers={eventHandlers}
    />
  );
};

export default PianoKey;
