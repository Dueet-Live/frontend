import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import * as Tone from 'tone';
import { Player } from 'tone';
import { Part } from '../../types/messages';
import {
  AudioPlayer,
  NullSoundFontPlayerNoteAudio,
} from '../Piano/utils/InstrumentPlayer/AudioPlayer';
import { PianoContext } from '../../contexts/PianoContext';
import {
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../../utils/useDimensions';
import useWindowDimensions from '../../utils/useWindowDimensions';
import InteractivePiano from '../Piano/InteractivePiano';
import { Waterfall } from '../Waterfall';
import { calculateLookAheadTime } from '../Waterfall/utils';
import { MidiJSON } from '../../types/MidiJSON';
import GameEndView from './GameEndView';
import { calculateSongDuration, getPlaybackNotes } from '../../utils/songInfo';
import ProgressBar from './ProgressBar';

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
  chosenSongMIDI: MidiJSON;
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
  const [gameEnd, setGameEnd] = useState(false);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);

  // Song information
  const { tracks } = chosenSongMIDI;
  const songDuration = calculateSongDuration(tracks);
  // 0 for solo
  // 0 for primo, 1 for secondo
  let playerTrackNum = myPart === 'secondo' ? 1 : 0;
  // 1 for solo, 2 for secondo
  let playbackChannel = myPart === undefined ? 1 : 2;
  const playerNotes = tracks[playerTrackNum].notes;
  // TODO: schedule change (if have time), now take the first value only
  const keyboardVolume = playerNotes[0].velocity;

  const { tempos, timeSignatures } = chosenSongMIDI.header;
  const bpm = tempos[0].bpm;
  const [beatsPerBar, noteDivision] = timeSignatures[0].timeSignature;
  const lookAheadTime =
    calculateLookAheadTime(bpm, beatsPerBar, noteDivision) / 1000;
  const delayedStartTime = lookAheadTime + startTime;

  useEffect(() => {
    const startTime = Tone.now() + countDown;
    const delayedStartTime = lookAheadTime + startTime;
    setStartTime(startTime);
    console.log('Game start', startTime);

    Tone.Transport.start();

    // Schedule countdown
    for (let i = 0; i < countDown; i++) {
      Tone.Transport.schedule(() => {
        setTimeToStart(countDown - 1 - i);
      }, startTime - (countDown - 1 - i) - Tone.now());
    }

    // Schedule ending screen
    Tone.Transport.schedule(() => {
      setGameEnd(true);
    }, delayedStartTime + songDuration - Tone.now() + 0.1);

    // TODO: schedule keyboard volume change

    // Schedule playback
    // TODO: share the same player as the keyboard
    const audioPlayer = new AudioPlayer();
    audioPlayer.setInstrument('acoustic_grand_piano');
    const handlers: (Player | NullSoundFontPlayerNoteAudio)[] = [];
    const playbackNotes = getPlaybackNotes(tracks, playbackChannel);
    playbackNotes.forEach(note => {
      Tone.Transport.schedule(() => {
        const handler = audioPlayer.playNoteWithDuration(
          note.midi,
          note.time + delayedStartTime,
          note.duration,
          note.velocity
        );
        handlers.push(handler);
      }, note.time + delayedStartTime - Tone.now() - 1);
    });

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      handlers.forEach(handler => {
        handler.stop();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, lookAheadTime, playbackChannel]);

  // Scoring
  const didPlayNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Play', Tone.now() - delayedStartTime);
    handleNotePlay(note, playedBy);
  };
  const didStopNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Stop', Tone.now() - delayedStartTime);
    handleNoteStop(note, playedBy);
  };

  // Calculate keyboard dimension
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const { height } = useWindowDimensions();
  const smallStartNote = tracks[playerTrackNum].smallStartNote || 72;
  const regularStartNote = tracks[playerTrackNum].regularStartNote || 72;
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

  const middleBox = () => {
    if (timeToStart !== 0) {
      return (
        <Typography variant="h1" align="center" color="primary">
          {timeToStart}
        </Typography>
      );
    }

    if (!gameEnd) {
      return (
        <Waterfall
          keyboardDimension={keyboardDimension}
          startTime={startTime * 1000}
          dimension={middleBoxDimensions}
          bpm={bpm}
          beatsPerBar={beatsPerBar}
          noteDivision={noteDivision}
          notes={playerNotes}
        />
      );
    }

    return <GameEndView />;
  };

  return (
    <div className={classes.root}>
      {!gameEnd && (
        <ProgressBar
          startTime={startTime}
          delayedStartTime={delayedStartTime}
          songDuration={songDuration}
        />
      )}
      <div ref={middleBoxRef} className={classes.middleBox}>
        {middleBox()}
      </div>
      <div className={classes.piano}>
        {!gameEnd && (
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
        )}
      </div>
    </div>
  );
};

export default GameView;
