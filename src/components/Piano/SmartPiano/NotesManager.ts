import { MappedNote } from '../types/mappedNote';
import { Queue } from './Queue';

const ERROR_MSG = 'Ran out of notes in notes manager.';

/** Manages the notes of a key. */
export class NotesManager {
  notes: Queue<MappedNote>;

  constructor(notes: MappedNote[]) {
    this.notes = new Queue(notes);
  }

  /**
   * Manages the mapped notes by updating them if needed.
   * @param timeElapsed Amount of time that has elapsed since the start of the first note.
   */
  manage(timeElapsed: number) {
    console.assert(!this.notes.isEmpty(), ERROR_MSG);
    while (this.notes.peek()!.expiry < timeElapsed) {
      this.notes.pop();
      console.assert(!this.notes.isEmpty(), ERROR_MSG);
    }
  }

  /**
   * Returns the first note that is still being managed by the manager.
   *
   * Note that the value returned may not be updated. To ensure that it is updated, call `manage` first.
   */
  get firstNote() {
    console.assert(!this.notes.isEmpty(), ERROR_MSG);
    return this.notes.peek()!;
  }
}
