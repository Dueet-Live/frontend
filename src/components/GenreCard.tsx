import { Button } from '@material-ui/core';
import React from 'react';

const GenreCard: React.FC<{
  genre: string;
  onClick: () => void;
}> = ({ genre, onClick }) => {
  return <Button onClick={onClick}>{genre}</Button>;
};

export default GenreCard;
