import * as Tone from 'tone';

export default function isAccidentalNote(note: number) {
  return Tone.Frequency(note, 'midi').toNote().includes('#');
}
