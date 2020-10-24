import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { Part } from '../types/messages';
import {
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../utils/useDimensions';
import { Waterfall } from './Waterfall';
import InteractivePiano from './Piano/InteractivePiano';
import * as Tone from 'tone';
import { Note } from './Waterfall/types';
import InstrumentPlayer from './Piano/utils/InstrumentPlayer';
import { calculateLookAheadTime } from './Waterfall/utils';
import useWindowDimensions from '../utils/useWindowDimensions';
import { Player } from 'tone';
import { NullSoundFontPlayerNoteAudio } from './Piano/utils/InstrumentPlayer/AudioPlayer';
import { PianoContext } from '../contexts/PianoContext';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
  },
  middleBox: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: '0px',
    position: 'relative',
  },
  piano: {
    flexGrow: 0,
  },
}));

type Props = {
  chosenSongMIDI: any;
  myPart?: Part | null;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
  handleScoreUpdate?: (newScore: number) => void /* tentative */;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  myPart,
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const classes = useStyles();
  const [startTime, setStartTime] = useState(-1);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);

  // Scoring
  const didPlayNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Play', Tone.now() - startTime);
    handleNotePlay(note, playedBy);
  };
  const didStopNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Stop', Tone.now() - startTime);
    handleNoteStop(note, playedBy);
  };

  // 0 for solo
  // 0 for primo, 1 for secondo
  let trackNum = 0;
  if (myPart === 'secondo') {
    trackNum = 1;
  }

  const tracks = chosenSongMIDI.tracks;
  // TODO: consider duet mode
  const playerNotes = tracks[0].notes;
  const bpm = chosenSongMIDI.header?.tempos[0].bpm;
  const [beatsPerBar, noteDivision] =
    chosenSongMIDI.header === undefined
      ? [0, 0]
      : chosenSongMIDI.header.timeSignatures[0].timeSignature;
  const lookAheadTime = calculateLookAheadTime(bpm, beatsPerBar, noteDivision);
  // TODO: update
  const keyboardVolume = playerNotes[0].velocity;

  useEffect(() => {
    const startTime = Tone.now() + countDown;
    setStartTime(startTime);
    console.log('Game start', startTime);

    Tone.Transport.start();

    // Schedule countdown
    for (let i = 0; i < countDown; i++) {
      Tone.Transport.schedule(() => {
        setTimeToStart(countDown - 1 - i);
      }, startTime - (countDown - 1 - i) - Tone.now());
    }

    // TODO: Schedule ending screen
    // const songDuration = 126;
    // Tone.Transport.schedule(() => {

    // }, startTime + songDuration - Tone.now());

    // TODO: schedule keyboard volume change

    // Schedule playback
    const instrumentPlayer = new InstrumentPlayer();
    const handlers: (Player | NullSoundFontPlayerNoteAudio)[] = [];
    // TODO: consider duet mode
    (tracks[1].notes.concat(tracks[2].notes) as Note[]).forEach(note => {
      Tone.Transport.schedule(() => {
        const handler = instrumentPlayer.playNote(
          note.midi,
          note.time + startTime + lookAheadTime / 1000,
          note.duration,
          note.velocity
        );
        handlers.push(handler);
      }, note.time + startTime + lookAheadTime / 1000 - Tone.now() - 1);
    });
    // TODO: remove
    (tracks[0].notes as Note[]).forEach(note => {
      Tone.Transport.schedule(() => {
        const handler = instrumentPlayer.playNote(
          note.midi,
          note.time + startTime + lookAheadTime / 1000,
          note.duration,
          5
        );
        handlers.push(handler);
      }, note.time + startTime + lookAheadTime / 1000 - Tone.now() - 1);
    });

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      handlers.forEach(handler => {
        handler.stop();
      });
    };
  }, [tracks, lookAheadTime]);

  // Calculate keyboard dimension
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const { height } = useWindowDimensions();
  const smallStartNote = !tracks ? 72 : tracks[trackNum].smallStartNote;
  const regularStartNote = !tracks ? 72 : tracks[trackNum].regularStartNote;
  const keyboardDimension = calculateGamePianoDimension(
    middleBoxDimensions.width,
    smallStartNote,
    regularStartNote
  );
  const keyHeight = calculateKeyHeight(height);

  // Get custom keyboard mapping for game
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = isDesktopView
    ? getKeyboardMappingWithSpecificStart(regularStartNote, keyboardDimension)
    : undefined;

  return (
    <div className={classes.root}>
      <div ref={middleBoxRef} className={classes.middleBox}>
        {timeToStart !== 0 ? (
          <Typography variant="h1" align="center" color="primary">
            {timeToStart}
          </Typography>
        ) : (
          <Waterfall
            keyboardDimension={keyboardDimension}
            startTime={startTime * 1000}
            dimension={middleBoxDimensions}
            bpm={bpm}
            beatsPerBar={beatsPerBar}
            noteDivision={noteDivision}
            notes={playerNotes}
          />
        )}
      </div>
      <div className={classes.piano}>
        <PianoContext.Provider value={{ volume: keyboardVolume }}>
          <InteractivePiano
            includeOctaveShift={false}
            keyboardDimension={keyboardDimension}
            keyHeight={keyHeight}
            keyboardMap={keyboardMap}
            didPlayNote={didPlayNote}
            didStopNote={didStopNote}
          />
        </PianoContext.Provider>
      </div>
    </div>
  );
};

export default GameView;
