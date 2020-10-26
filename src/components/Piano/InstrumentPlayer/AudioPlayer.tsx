import SoundFontPlayer, { InstrumentName, Player } from 'soundfont-player';
import { AudioContext } from './AudioContext';
import * as Tone from 'tone';
import { BaseContext } from 'tone';

/**
 * Define a null object for soundfont-player instruments.
 * NullSoundFontPlayerInstrument does not contain all methods from
 * soundfont-player instruments, only the ones used in this project.
 *
 * For more details about soundfont-player instruments, refer to:
 * https://github.com/danigb/soundfont-player
 */

export class NullSoundFontPlayerNoteAudio {
  // eslint-disable-next-line class-methods-use-this
  stop() {}
}

class NullSoundFontPlayer {
  // eslint-disable-next-line class-methods-use-this
  play() {
    return new NullSoundFontPlayerNoteAudio();
  }

  schedule(when: number, events: any[]) {
    return new NullSoundFontPlayerNoteAudio();
  }
}

export class AudioPlayer {
  audioContext: BaseContext;
  soundFontPlayer: NullSoundFontPlayer | Player;
  defaultVolume: number;
  maxVolume: number = 5;

  constructor(defaultVolume: number = 1) {
    this.audioContext = Tone.context;
    this.soundFontPlayer = new NullSoundFontPlayer();
    this.defaultVolume = defaultVolume;
  }

  // For a full list of supported instruments, refer to:
  // https://github.com/danigb/soundfont-player/blob/master/instruments.json
  setInstrument(instrumentName: InstrumentName) {
    SoundFontPlayer.instrument(
      this.audioContext.rawContext as AudioContext,
      instrumentName,
      { gain: this.maxVolume }
    )
      .then(soundFontPlayer => {
        this.soundFontPlayer = soundFontPlayer;
      })
      .catch(() => {
        this.soundFontPlayer = new NullSoundFontPlayer();
      });
  }

  playNote(note: number, volume?: number) {
    // console.log("Play " + note)
    if (volume === undefined) {
      return this.soundFontPlayer.play(note.toString(), 0, {
        gain: this.defaultVolume * this.maxVolume,
      });
    } else {
      return this.soundFontPlayer.play(note.toString(), 0, {
        gain: volume * this.maxVolume,
      });
    }
  }

  playNoteWithDuration(
    note: number,
    time: number,
    duration: number,
    volume: number
  ) {
    // console.log("Play " + note)
    return this.soundFontPlayer.play(note.toString(), time, {
      duration,
      gain: volume * this.maxVolume,
    });
  }
}
