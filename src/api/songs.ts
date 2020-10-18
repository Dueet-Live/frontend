import { Song, SongWithContent } from '../types/song';
import base from './base';

const songsAPI = {
  getSongs: async (): Promise<[Song]> => {
    return base.getData('/songs');
  },
  getSongWithContent: async (songId: number): Promise<SongWithContent> => {
    return base.getData(`/songs/${songId}/content`);
  },
};

export default songsAPI;
