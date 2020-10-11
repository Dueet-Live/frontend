import React, { Component } from 'react';
import { InstrumentName } from 'soundfont-player';
import InstrumentAudio from './InstrumentAudio';
import { addNotePlayListener } from '../../utils/socket';
import { PlayerContext } from '../PlayerContext';
import { PlayingNote } from '../../types/PlayingNote';

type Props = {
  instrument: InstrumentName;
  keyboardMap: { [key: string]: number };
  didPlayNote: (note: number, playerId: number) => void;
  didStopNote: (note: number, playerId: number) => void;
  renderInstrument: ({
    notesPlaying,
    onPlayNoteStart,
    onPlayNoteEnd,
  }: {
    notesPlaying: PlayingNote[];
    onPlayNoteStart: (note: number, playerId: number) => void;
    onPlayNoteEnd: (note: number, playerId: number) => void;
  }) => JSX.Element[];
};

type State = {
  notesPlaying: PlayingNote[];
};

function isRegularKey(event: KeyboardEvent) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

export default class Instrument extends Component<Props> {
  static contextType = PlayerContext;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      notesPlaying: [],
    };

    this.startPlayingNote = this.startPlayingNote.bind(this);
    this.stopPlayingNote = this.stopPlayingNote.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    addNotePlayListener(
      this.handleNotePlayByOtherPlayer,
      this.handleNoteStopByOtherPlayer
    );
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleNotePlayByOtherPlayer = (note: number) => {
    let playerId = this.context.friend;
    this.startPlayingNote(note, playerId);
  };

  handleNoteStopByOtherPlayer = (note: number) => {
    let playerId = this.context.friend;
    this.stopPlayingNote(note, playerId);
  };

  getNoteFromKeyboardKey(keyboardKey: string) {
    const { keyboardMap } = this.props;
    return keyboardMap[keyboardKey.toUpperCase()];
  }

  handleKeyDown(event: KeyboardEvent) {
    if (isRegularKey(event) && !event.repeat) {
      const note = this.getNoteFromKeyboardKey(event.key);
      if (note) {
        this.startPlayingNote(note, this.context.me);
      }
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if (isRegularKey(event)) {
      const note = this.getNoteFromKeyboardKey(event.key);
      if (note) {
        this.stopPlayingNote(note, this.context.me);
      }
    }
  }

  startPlayingNote(note: number, playerId: number) {
    this.props.didPlayNote(note, playerId);
    this.setState(({ notesPlaying }: State) => ({
      notesPlaying: [...notesPlaying, { note, playerId }],
    }));
  }

  stopPlayingNote(note: number, playerId: number) {
    this.props.didStopNote(note, playerId);
    this.setState(({ notesPlaying }: State) => ({
      notesPlaying: notesPlaying.filter(
        notePlaying =>
          notePlaying.note !== note || notePlaying.playerId !== playerId
      ),
    }));
  }

  render() {
    const { instrument, renderInstrument } = this.props;
    const { notesPlaying } = this.state;

    return (
      <>
        {renderInstrument({
          notesPlaying,
          onPlayNoteStart: this.startPlayingNote,
          onPlayNoteEnd: this.stopPlayingNote,
        })}
        <InstrumentAudio
          notes={notesPlaying.map(notePlaying => notePlaying.note.toString())}
          instrument={instrument}
        />
      </>
    );
  }
}
