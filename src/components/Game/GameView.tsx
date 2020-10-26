import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import * as Tone from 'tone';
import { Player } from 'tone';
import { Part } from '../../types/messages';
import { NullSoundFontPlayerNoteAudio } from '../Piano/InstrumentPlayer/AudioPlayer';
import { getSmartKeyboardMapping } from '../../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../../utils/useDimensions';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { default as Waterfall } from '../Waterfall';
import { calculateLookAheadTime } from '../Waterfall/utils';
import { MidiJSON } from '../../types/MidiJSON';
import GameEndView from './GameEndView';
import ProgressBar from './ProgressBar';
import {
  calculateSongDuration,
  getPlaybackNotes,
  getSmartMappingChangeEvents,
  getSmartNotes,
  SmartMappingChangeEvent,
} from '../../utils/songInfo';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import SmartPiano from '../Piano/SmartPiano/SmartPiano';
import {
  calculateSmartKeyboardDimension,
  calculateSmartKeyHeight,
} from '../../utils/calculateSmartKeyboardDimension';

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
  const { tracks, header } = chosenSongMIDI;
  const songDuration = calculateSongDuration(tracks);
  const { tempos, timeSignatures } = header;
  const bpm = tempos[0].bpm;
  const [beatsPerBar, noteDivision] = timeSignatures[0].timeSignature;
  const lookAheadTime = useMemo(
    () => calculateLookAheadTime(bpm, beatsPerBar, noteDivision) / 1000,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const delayedStartTime = lookAheadTime + startTime;
  // 0 for solo
  // 0 for primo, 1 for secondo
  let playerTrackNum = myPart === 'secondo' ? 1 : 0;
  // 1 for solo, 2 for secondo
  let playbackChannel = myPart === undefined ? 1 : 2;

  // Transform to smart notes
  const normalPlayerNotes = tracks[playerTrackNum].notes;
  const mappingChangeEvents: SmartMappingChangeEvent[] = useMemo(
    () => getSmartMappingChangeEvents(normalPlayerNotes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const playerNotes = useMemo(
    () => getSmartNotes(normalPlayerNotes, mappingChangeEvents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [currentMapping, setCurrentMapping] = useState<number[]>(
    mappingChangeEvents[0].mapping
  );

  // Initialise instrument
  // TODO: schedule change (if have time), now take the first value only
  const keyboardVolume = playerNotes[0].velocity;
  const instrumentPlayer = useMemo(
    () => new InstrumentPlayer(keyboardVolume),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const startTime = Tone.now() + countDown;
    const delayedStartTime = lookAheadTime + startTime;
    setStartTime(startTime);
    console.log('Game start', startTime);

    Tone.Transport.start();

    // TODO: Schedule smart mapping change events
    mappingChangeEvents.forEach(({ time, mapping }) => {
      Tone.Transport.schedule(() => {
        setCurrentMapping(mapping);
      }, delayedStartTime + time - Tone.now());
    });

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
    instrumentPlayer.setInstrument('acoustic_grand_piano');
    const handlers: (Player | NullSoundFontPlayerNoteAudio)[] = [];
    const playbackNotes = getPlaybackNotes(tracks, playbackChannel);
    playbackNotes.forEach(note => {
      Tone.Transport.schedule(() => {
        const handler = instrumentPlayer.playNoteWithDuration(
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
  }, [tracks, lookAheadTime, playbackChannel, instrumentPlayer]);

  // TODO: scoring
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
  const keyboardDimension = useMemo(
    () => calculateSmartKeyboardDimension(middleBoxDimensions.width),
    [middleBoxDimensions]
  );
  const keyHeight = useMemo(() => calculateSmartKeyHeight(height), [height]);

  // Get custom traditional keyboard mapping for game
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = isDesktopView ? getSmartKeyboardMapping() : undefined;

  const middleBox = useMemo(() => {
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
          waterfallDimension={middleBoxDimensions}
          bpm={bpm}
          beatsPerBar={beatsPerBar}
          noteDivision={noteDivision}
          notes={playerNotes}
        />
      );
    }

    return <GameEndView />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeToStart, gameEnd]);

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
        {middleBox}
      </div>
      <div className={classes.piano}>
        {!gameEnd && (
          <SmartPiano
            instrumentPlayer={instrumentPlayer}
            keyHeight={keyHeight}
            keyWidth={keyboardDimension.keyWidth}
            smartMapping={currentMapping}
            keyboardMap={keyboardMap}
            didPlayNote={didPlayNote}
            didStopNote={didStopNote}
          />
        )}
      </div>
    </div>
  );
};

export default GameView;
