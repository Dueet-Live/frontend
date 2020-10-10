export default function getKeyboardShortcutForNote(
  keyboardMap: { [key: string]: number },
  note: number
) {
  const keyboardShortcuts = Object.keys(keyboardMap);
  return keyboardShortcuts.filter(shortcut => keyboardMap[shortcut] === note);
}
