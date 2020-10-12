import { Button } from '@material-ui/core';
import React from 'react';
import { SongInfo } from '../types/SongInfo';

const SongCard: React.FC<{
  songInfo: SongInfo;
  onClick: () => void;
}> = ({ songInfo, onClick }) => {
  return <Button onClick={onClick}>{songInfo.title}</Button>;
};

export default SongCard;
