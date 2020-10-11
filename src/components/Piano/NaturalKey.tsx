import React, { useContext } from 'react';
import { PlayerContext } from '../PlayerContext';
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

const NaturalKey: React.FC<Props> = ({
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
        return 'interactive-piano__natural-key--playing-by-me';
      } else {
        return 'interactive-piano__natural-key--playing-by-others';
      }
    }
  };

  return (
    <button
      className={`interactive-piano__natural-key ${getClassName()}`}
      style={{ width: keyWidth }}
      {...eventHandlers}
    >
      <div className={'interactive-piano__text'}>{text}</div>
    </button>
  );
};

export default NaturalKey;
