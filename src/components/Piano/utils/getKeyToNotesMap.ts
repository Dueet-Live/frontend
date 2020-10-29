import { getPrefixOfNote } from '../../../utils/getPrefixOfNote';
import { getNoteNamePrefixToIndexMap } from '../../../utils/getNoteNamePrefixToIndexMap';
import { MappedNote } from '../types/mappedNote';

type NamedNote = {
  midi: number;
  time: number;
  duration: number;
  name: string;
};

/** Gets the notes that belong to each index, and returns the list of result as a map. */
export const getIndexToNotesMap = (notes: NamedNote[]) => {
  const notePrefixMap = getNoteNamePrefixToIndexMap();

  // initialise map with mappings
  const startKeyboardNotes = getStartingKeyboardNotes(notes);
  const map = startKeyboardNotes.map(note => [note]);

  for (let note of notes) {
    const prefix = getPrefixOfNote(note.name);
    const index = notePrefixMap.get(prefix)!;

    const notesAtIndex = map[index];
    const lastAddedNoteAtIndex = notesAtIndex[notesAtIndex.length - 1];
    if (lastAddedNoteAtIndex.midi === note.midi) {
      continue;
    }

    const expiry = note.duration + note.time;
    if (isMoreThanOctaveChange(lastAddedNoteAtIndex.midi, note.midi)) {
      const newOctave = getOctave(note.midi);
      updateMap(map, newOctave, expiry);
    } else {
      updateNotesAtIndex(notesAtIndex, note.midi, expiry);
    }
  }

  return map;
};

const NUM_UNIQUE_NOTES_IN_OCTAVE = 12;
const NUM_INDICES = 7;

const DEFAULT_MIDI_VALUE = [60, 62, 64, 65, 67, 69, 71];
console.assert(
  NUM_INDICES === DEFAULT_MIDI_VALUE.length,
  "Default values' length do not match"
);
const FIRST_MIDI_NOTE_OF_FIRST_OCTAVE = 12;
const ENDING_BUFFER_TIME = 10000; // determines how long the very last mapping of notes last for

/** Returns an initial mapping of midi notes to indices (of the array). */
const getStartingKeyboardNotes = (notes: NamedNote[]) => {
  let numNotesLeftToFill = NUM_INDICES;
  const notePrefixMap = getNoteNamePrefixToIndexMap();
  const mapping: Array<number | null> = Array(numNotesLeftToFill).fill(null);

  for (let i = 0; i < notes.length && numNotesLeftToFill > 0; i++) {
    const currentNote = notes[i];
    const prefix = getPrefixOfNote(currentNote.name);
    const index = notePrefixMap.get(prefix);

    if (mapping[index!] === null) {
      mapping[index!] = currentNote.midi;
    }
  }

  // determine the correct octave which the notes should start from
  const firstNote = notes[0];
  const startingOctave = getOctave(firstNote.midi);
  const expiry = firstNote.duration + firstNote.time;

  // ensure that all mappings are complete, if not use default midi values for mapping
  return mapping.map((midi, index) => {
    midi = midi === null ? DEFAULT_MIDI_VALUE[index] : midi;
    return {
      midi: changeToOctave(midi, startingOctave),
      expiry: expiry,
    } as MappedNote;
  });
};

const getOctave = (midi: number) =>
  (midi - FIRST_MIDI_NOTE_OF_FIRST_OCTAVE) / NUM_UNIQUE_NOTES_IN_OCTAVE;

/** Changes `midi` value such that it is shifted by `numOctaves`. */
const changeByNumOctaves = (midi: number, numOctaves: number) =>
  midi + numOctaves * NUM_UNIQUE_NOTES_IN_OCTAVE;

/** Changes `midi` to its corresponding value at the `octave`th octave. */
const changeToOctave = (midi: number, octave: number) => {
  const currentOctave = getOctave(midi);
  return changeByNumOctaves(midi, octave - currentOctave);
};

const isMoreThanOctaveChange = (prevMidi: number, currMidi: number) =>
  Math.abs(prevMidi - currMidi) > NUM_UNIQUE_NOTES_IN_OCTAVE;

/**
 * Updates `map` by adding more notes to each index such that they are found at `octave`
 * and each of the last added note's expiry is also updated to `expiry`.
 *
 * Note that this function directly modifies `map`.
 */
const updateMap = (map: MappedNote[][], octave: number, expiry: number) => {
  for (let i = 0; i < map.length; i++) {
    const notesAtIndex = map[i];
    const lastAddedNoteAtIndex = notesAtIndex[notesAtIndex.length - 1];
    lastAddedNoteAtIndex.expiry = expiry;
    notesAtIndex.push({
      midi: changeToOctave(lastAddedNoteAtIndex.midi, octave),
      expiry: expiry + ENDING_BUFFER_TIME,
    } as MappedNote);
  }
};

const updateNotesAtIndex = (
  notesAtIndex: MappedNote[],
  newMidi: number,
  expiry: number
) => {
  const lastAddedNoteAtIndex = notesAtIndex[notesAtIndex.length - 1];
  lastAddedNoteAtIndex.expiry = expiry;
  notesAtIndex.push({
    midi: newMidi,
    expiry: expiry + ENDING_BUFFER_TIME,
  } as MappedNote);
};
