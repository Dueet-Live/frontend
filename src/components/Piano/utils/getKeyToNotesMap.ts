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

  let prevNote = notes[0];
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const prefix = getPrefixOfNote(note.name);
    const index = notePrefixMap.get(prefix)!;

    const notesAtIndex = map[index];
    const lastAddedNoteAtIndex = notesAtIndex[notesAtIndex.length - 1];

    if (isMoreThanOctaveChange(lastAddedNoteAtIndex.midi, note.midi)) {
      const newOctave = getOctave(note.midi);
      updateMap(map, newOctave, index, note, prevNote);
    } else if (lastAddedNoteAtIndex.midi !== note.midi) {
      updateNotesAtIndex(
        notesAtIndex,
        note.midi,
        prevNote.time + prevNote.duration / 2 // to mitigate issues with early playing
      );
    }

    prevNote = note;
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
// determines how long the very last mapping of notes last for; NOTE: assumes that song won't last longer than 10 minutes
const ENDING_BUFFER_TIME = 600;

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
  Math.floor(
    (midi - FIRST_MIDI_NOTE_OF_FIRST_OCTAVE) / NUM_UNIQUE_NOTES_IN_OCTAVE
  );

/** Changes `midi` value such that it is shifted by `numOctaves`. */
const changeByNumOctaves = (midi: number, numOctaves: number) =>
  midi + numOctaves * NUM_UNIQUE_NOTES_IN_OCTAVE;

/** Changes `midi` to its corresponding value at the `octave`th octave. */
const changeToOctave = (midi: number, octave: number) => {
  const currentOctave = getOctave(midi);
  return changeByNumOctaves(midi, octave - currentOctave);
};

const isMoreThanOctaveChange = (prevMidi: number, currMidi: number) =>
  Math.abs(prevMidi - currMidi) + 1 > NUM_UNIQUE_NOTES_IN_OCTAVE;

/**
 * Updates `map` by adding more notes to each index such that they are found at `octave`
 * and each of the last added note's expiry is also updated. Last added notes that are not
 * located at `affectedIndex` will have their expiry updated to `prevTime + 1.5 prevDuration`
 * (so that the playing will sound more natural if the user plays the previous note too late)
 * while the notes located at `affectedIndex` will have an earlier expiry of `prevTime + 0.5
 * prevDuration` (so that the playing will sound more natural if the user plays the note too
 * early).
 *
 * Note that this function directly modifies `map`.
 */
const updateMap = (
  map: MappedNote[][],
  octave: number,
  affectedIndex: number,
  currentNote: NamedNote,
  prevNote: NamedNote
) => {
  for (let i = 0; i < map.length; i++) {
    const notesAtIndex = map[i];
    const lastAddedNoteAtIndex = notesAtIndex[notesAtIndex.length - 1];
    const expiry =
      (affectedIndex === i ? -prevNote.duration * 0.5 : currentNote.duration) +
      prevNote.duration +
      prevNote.time;
    lastAddedNoteAtIndex.expiry = expiry;
    notesAtIndex.push({
      midi:
        affectedIndex === i
          ? changeToOctave(lastAddedNoteAtIndex.midi, octave)
          : currentNote.midi,
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
