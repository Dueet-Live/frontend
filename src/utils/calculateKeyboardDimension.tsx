// At least 2 octaves
export function calculateKeyboardRange(width: number): number {
  return Math.max(Math.floor(width / 50), 24);
}

// At most 50px
export function calculateKeyWidth(width: number): number {
  return Math.min(50, Math.floor(width / 24));
}
