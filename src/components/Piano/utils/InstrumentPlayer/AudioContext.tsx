export const AudioContext =
  window.AudioContext ||
  ((window as any).webkitAudioContext as typeof window.AudioContext);
