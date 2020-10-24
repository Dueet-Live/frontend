import * as Tone from 'tone';

export const startAudioContext = () => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
};
