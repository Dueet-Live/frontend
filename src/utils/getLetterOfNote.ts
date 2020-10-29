const noteRegExpression = /(?<letter>[A-G])/;

/**
 * Gets the letter portion of a note's name.
 *
 * @param noteName name of note
 */
export const getLetterOfNote = (noteName: string) =>
  noteRegExpression.exec(noteName)!.groups!.letter;
