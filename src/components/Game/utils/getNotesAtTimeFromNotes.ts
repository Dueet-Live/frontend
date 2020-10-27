import { Note } from '../../../types/MidiJSON';

/**
 * Returns a tuple of [notes at this time, index of first note that passes]
 */
export default function getNotesAtTimeFromNotes(
  currentTime: number,
  notes: Note[],
  prevIndex: number
): [Set<number>, number] {
  const currentNotes = new Set<number>();
  let index = prevIndex;
  let found = false;

  for (let i = prevIndex; i < notes.length; i++) {
    const note = notes[i];

    // we assume notes is sorted ascending by note.time
    if (note.time > currentTime) break;

    // be strict first, adjust later
    if (note.time <= currentTime && currentTime <= note.time + note.duration) {
      if (!found) {
        index = i;
        found = true;
      }
      currentNotes.add(note.midi);
    }
  }

  return [currentNotes, index];
}
