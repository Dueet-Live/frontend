import { Genre, GenreWithSongs } from '../types/song';
import base from './base';

const genresAPI = {
  getGenres: async (): Promise<[Genre]> => {
    return base.getData('/genres');
  },
  getGenresWithSongs: async (genre: string): Promise<[GenreWithSongs]> => {
    return base.getData(`/genres/${genre}`);
  },
};

export default genresAPI;
