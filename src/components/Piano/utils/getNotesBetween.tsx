export default function getNotesBetween(startNote: number, endNote: number) {
  var notes = [];
  for (var i = startNote; i <= endNote; i++) {
    notes.push(i);
  }
  return notes;
}
