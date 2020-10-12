// Temporary file, will be removed when the backend is setup

import { SongInfo } from '../types/SongInfo';

// might want to change the format next time
const songList: { [genre: string]: SongInfo[] } = {
  classical: [
    {
      id: '1',
      title: 'Dance of the Sugar Plum Fairy',
    },
  ],
};

export default songList;
