import React, { Component } from 'react';
import InstrumentAudio from './InstrumentAudio';
import { addNotePlayListener } from '../../utils/socket';
import { PlayerContext } from '../PlayerContext';

function isRegularKey(event) {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

export default class Instrument extends Component {
  static contextType = PlayerContext;

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
    addNotePlayListener(
      this.handleNotePlayByOtherPlayer,
      this.handleNoteStopByOtherPlayer
    );
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleNotePlayByOtherPlayer = note => {
    let playerId = this.context.friend;
    this.startPlayingNote(note, playerId);
  };

  handleNoteStopByOtherPlayer = note => {
    let playerId = this.context.friend;
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
        this.startPlayingNote(note, this.context.me);
      }
    }
  }

  handleKeyUp(event) {
    if (isRegularKey(event)) {
      const note = this.getNoteFromKeyboardKey(event.key);
      if (note) {
        this.stopPlayingNote(note, this.context.me);
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
