import { Part } from '../types/messages';

export const getDisplayNameForPart = (part: Part): string => {
  // Exhaustive matching
  switch (part) {
    case 'primo':
      return 'melody';
    case 'secondo':
      return 'bass';
  }
};
