import React, { useState } from 'react';
import { PlayingNote } from '../types/playingNote';
import './SmartPiano.css';

type Props = {
  index: number;
  keyWidth: number;
  keyHeight: number;
  startPlayingNote: () => void;
  stopPlayingNote: () => void;
  keyboardShortcut: string[];
  useTouchEvents: boolean;
  playingNote: PlayingNote[];
};

const SmartPianoKey: React.FC<Props> = ({
  index,
  keyWidth,
  keyHeight,
  startPlayingNote, // Unchanged
  stopPlayingNote, // Unchanged
  keyboardShortcut, // Unchanged
  useTouchEvents: useTouchscreen,
  playingNote,
}) => {
  const [useTouchEvents, setUseTouchEvents] = useState(useTouchscreen);

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    // console.log(`Mouse down ${note}`);
    event.preventDefault();
    event.stopPropagation();
    startPlayingNote();
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    // console.log(`Mouse up ${note}`);
    event.stopPropagation();
    stopPlayingNote();
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (event.buttons) {
      // console.log(`Mouse enter ${note}`);
      startPlayingNote();
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  const eventHandlers = !useTouchEvents
    ? {
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onTouchStart: handleTouchStart,
      }
    : {};

  const getBottomText = () => {
    if (keyboardShortcut.length === 0) {
      return '';
    } else {
      // If there are multiple shortcuts, display the first shortcut only
      return keyboardShortcut[0];
    }
  };

  const getClassName = () => {
    if (playingNote.length === 0) {
      return '';
    } else {
      return 'smart-piano__key--playing-by-me';
    }
  };

  return (
    <button
      className={`smart-piano__key ${getClassName()}`}
      style={{ width: keyWidth, height: keyHeight }}
      data-index={index}
      {...eventHandlers}
    >
      <div className="smart-piano__text-container">
        <div className="smart-piano__text--bottom-text">{getBottomText()}</div>
      </div>
    </button>
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.keyWidth === nextProps.keyWidth &&
    prevProps.keyHeight === nextProps.keyHeight &&
    prevProps.index === nextProps.index &&
    prevProps.useTouchEvents === nextProps.useTouchEvents &&
    prevProps.playingNote.length === nextProps.playingNote.length // For smart piano, only my playing notes are included
  );
}

export default React.memo(SmartPianoKey, areEqual);
