import { Note } from '../../../types/MidiJSON';

export default function getNotesAtTimeFromNotes(
  currentTime: number,
  notes: Note[]
) {
  const currentNotes = new Set<number>();

  for (let note of notes) {
    // we assume notes is sorted ascending by note.time
    if (note.time > currentTime) break;

    // be strict first, adjust later
    if (note.time <= currentTime && currentTime <= note.time + note.duration) {
      currentNotes.add(note.midi);
    }
  }

  return currentNotes;
}
