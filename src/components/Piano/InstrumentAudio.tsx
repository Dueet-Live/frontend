import { Component } from 'react';
import { isEqual, List } from 'lodash';
import { InstrumentName } from 'soundfont-player';
import InstrumentPlayer from './utils/InstrumentPlayer';

type Props = {
  instrument: InstrumentName;
  notes: List<string>;
};

export default class InstrumentAudio extends Component<Props> {
  instrumentPlayer?: InstrumentPlayer;

  constructor(props: Props) {
    super(props);

    this.setInstrument = this.setInstrument.bind(this);
    this.playNotes = this.playNotes.bind(this);
  }

  componentDidMount() {
    this.instrumentPlayer = new InstrumentPlayer();
    this.setInstrument();
    this.playNotes();
  }

  componentDidUpdate(prevProps: Props) {
    if (!isEqual(this.props.instrument, prevProps.instrument)) {
      this.setInstrument();
    }

    if (!isEqual(this.props.notes, prevProps.notes)) {
      this.playNotes();
    }
  }

  setInstrument() {
    if (this.instrumentPlayer) {
      this.instrumentPlayer.setInstrument(this.props.instrument);
    }
  }

  playNotes() {
    if (this.instrumentPlayer) {
      this.instrumentPlayer.playNotes(this.props.notes);
    }
  }

  render() {
    return null;
  }
}
