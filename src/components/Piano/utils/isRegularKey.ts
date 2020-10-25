export default function isRegularKey(event: KeyboardEvent) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}
