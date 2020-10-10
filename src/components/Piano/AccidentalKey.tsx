import React from 'react';
import '../InteractivePiano.css';

type PlayingNote = {
  note: number;
  playerId: number;
};

type Props = {
  playingNote: PlayingNote[];
  keyWidth: number;
  text: string;
  eventHandlers: any;
};

const AccidentalKey: React.FC<Props> = ({
  playingNote,
  keyWidth,
  text,
  eventHandlers,
}) => {
  const getClassName = () => {
    if (playingNote.length === 0) {
      return '';
    } else {
      // TODO: replace with current player id
      if (playingNote[0].playerId === -1) {
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
        style={{ width: keyWidth }}
        {...eventHandlers}
      >
        <div className={'interactive-piano__text'}>{text}</div>
      </button>
    </div>
  );
};

export default AccidentalKey;
