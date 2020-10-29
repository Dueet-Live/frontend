const noteRegExpression = /(?<letter>[A-G])/;

/**
 * Gets the prefix (i.e. letter portion) of a note's name.
 *
 * @param noteName name of note
 */
export const getPrefixOfNote = (noteName: string) =>
  noteRegExpression.exec(noteName)!.groups!.letter;
