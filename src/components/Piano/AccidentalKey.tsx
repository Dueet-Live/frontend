import React, { useContext } from 'react';
import { PlayerContext } from '../PlayerContext';
import { PlayingNote } from '../../types/PlayingNote';
import '../InteractivePiano.css';

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
  const { me } = useContext(PlayerContext);
  const getClassName = () => {
    if (playingNote.length === 0) {
      return '';
    } else {
      if (playingNote[0].playerId === me) {
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
