import React, { useContext } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { PlayingNote } from '../../types/PlayingNote';
import './InteractivePiano.css';

type Props = {
  note: number;
  playingNote: PlayingNote[];
  keyWidth: number;
  keyHeight: number;
  topText: string;
  bottomText: string;
  eventHandlers: any;
};

const NaturalKey: React.FC<Props> = ({
  note,
  playingNote,
  keyWidth,
  keyHeight,
  topText = '',
  bottomText,
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
      style={{ width: keyWidth, height: keyHeight }}
      data-note={note}
      {...eventHandlers}
    >
      <div className={'interactive-piano__text-container'}>
        <div className="interactive-piano__text--top-text">{topText}</div>
        <div className="interactive-piano__text--bottom-text">{bottomText}</div>
      </div>
    </button>
  );
};

export default NaturalKey;
