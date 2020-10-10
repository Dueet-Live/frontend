import React, { Component } from 'react';
import InstrumentAudio from './InstrumentAudio';

function isRegularKey(event) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

export default class Instrument extends Component {
  constructor(props) {
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
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  // Listen for keydown event
  handleNotePlayByOtherPlayer = (note, playerId) => {
    // TODO: replace with current player id
    if (playerId === -1) {
      return;
    }

    this.startPlayingNote(note, playerId);
  };

  // Listen for keyup event
  handleNoteStopByOtherPlayer = (note, playerId) => {
    // TODO: replace with current player id
    if (playerId === -1) {
      return;
    }

    this.stopPlayingNote(note, playerId);
  };

  getNoteFromKeyboardKey(keyboardKey) {
    const { keyboardMap } = this.props;
    return keyboardMap[keyboardKey.toUpperCase()];
  }

  handleKeyDown(event) {
    if (isRegularKey(event) && !event.repeat) {
      const note = this.getNoteFromKeyboardKey(event.key);
      if (note) {
        // TODO: replace with current player id
        this.startPlayingNote(note, -1);
      }
    }
  }

  handleKeyUp(event) {
    if (isRegularKey(event)) {
      const note = this.getNoteFromKeyboardKey(event.key);
      if (note) {
        // TODO: replace with current player id
        this.stopPlayingNote(note, -1);
      }
    }
  }

  startPlayingNote(note, playerId) {
    this.props.didPlayNote(note, playerId);
    this.setState(({ notesPlaying }) => ({
      notesPlaying: [...notesPlaying, { note, playerId }],
    }));
  }

  stopPlayingNote(note, playerId) {
    this.props.didStopNote(note, playerId);
    this.setState(({ notesPlaying }) => ({
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
          notes={notesPlaying.map(notePlaying => notePlaying.note)}
          instrument={instrument}
        />
      </>
    );
  }
}

Instrument.defaultProps = {
  keyboardMap: {},
};
