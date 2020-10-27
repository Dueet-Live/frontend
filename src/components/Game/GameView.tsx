import { makeStyles } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import * as Tone from 'tone';
import { Player } from 'tone';
import { Part } from '../../types/messages';
import { NullSoundFontPlayerNoteAudio } from '../Piano/InstrumentPlayer/AudioPlayer';
import { useDimensions } from '../../utils/useDimensions';
import { calculateLookAheadTime } from '../Waterfall/utils';
import { MidiJSON, Note, SmartNote } from '../../types/MidiJSON';
import ProgressBar from './ProgressBar';
import {
  calculateSongDuration,
  getPlaybackNotes,
  getSmartMappingChangeEvents,
  getSmartNotes,
  SmartMappingChangeEvent,
} from '../../utils/songInfo';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import { calculateSmartKeyboardDimension } from '../../utils/calculateSmartKeyboardDimension';
import { calculateTraditionalKeyboardDimensionForGame } from '../../utils/calculateTraditionalKeyboardDimension';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import GameMiddleView from './GameMiddleView';
import GameTraditionalPiano from './GameTraditionalPiano';
import GameSmartPiano from './GameSmartPiano';

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
  showSmartPiano?: boolean;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
  handleScoreUpdate?: (newScore: number) => void /* tentative */;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  myPart,
  showSmartPiano = true,
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const classes = useStyles();

  const [startTime, setStartTime] = useState(-1);
  const [gameEnd, setGameEnd] = useState(false);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);

  /*************** Song information *****************/
  const { tracks, header } = chosenSongMIDI;
  const songDuration = useMemo(
    () => calculateSongDuration(tracks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const lookAheadTime = useMemo(() => {
    return calculateLookAheadTime(header);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const delayedStartTime = lookAheadTime + startTime;

  /*************** Player track information *****************/
  // 0 for solo
  // 0 for primo, 1 for secondo
  const playerTrackNum = myPart === 'secondo' ? 1 : 0;
  // 1 for solo, 2 for secondo
  const playbackChannel = myPart === undefined ? 1 : 2;
  const playerTrack = tracks[playerTrackNum];
  const normalPlayerNotes = playerTrack.notes;
  const mappingChangeEvents: SmartMappingChangeEvent[] = useMemo(
    () => getSmartMappingChangeEvents(normalPlayerNotes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [currentMapping, setCurrentMapping] = useState<number[]>(
    mappingChangeEvents.length === 0 ? [] : mappingChangeEvents[0].mapping
  );
  const playerNotes = useMemo<Note[] | SmartNote[]>(() => {
    if (showSmartPiano) {
      return getSmartNotes(normalPlayerNotes, mappingChangeEvents);
    } else {
      return normalPlayerNotes;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Initialise instrument *****************/
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

    // Schedule smart mapping change events (for smart piano only)
    if (showSmartPiano) {
      mappingChangeEvents.forEach(({ time, mapping }) => {
        Tone.Transport.schedule(() => {
          setCurrentMapping(mapping);
        }, delayedStartTime + time - Tone.now());
      });
    }

    // Schedule countdown
    for (let i = 0; i < countDown; i++) {
      Tone.Transport.schedule(() => {
        setTimeToStart(countDown - 1 - i);
      }, startTime - (countDown - 1 - i) - Tone.now());
    }

    // TODO: schedule keyboard volume change

    // Schedule playback
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
        // Schedule 1 sec before the note play
      }, note.time + delayedStartTime - Tone.now() - 1);
    });

    // Schedule ending screen
    Tone.Transport.schedule(() => {
      setGameEnd(true);
    }, delayedStartTime + songDuration - Tone.now() + 0.1);

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      handlers.forEach(handler => {
        handler.stop();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Callbacks *****************/
  const didPlayNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Play', note, playedBy, Tone.now() - delayedStartTime);
    handleNotePlay(note, playedBy);
  };
  const didStopNote = (note: number, playedBy: number) => {
    // TODO: update score
    console.log('Stop', note, playedBy, Tone.now() - delayedStartTime);
    handleNoteStop(note, playedBy);
  };

  /*************** Keyboard dimension *****************/
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const keyboardDimension = useMemo(() => {
    if (showSmartPiano) {
      return calculateSmartKeyboardDimension(middleBoxDimensions.width);
    } else {
      return calculateTraditionalKeyboardDimensionForGame(
        middleBoxDimensions.width,
        playerTrack
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [middleBoxDimensions.width]);

  /*************** Game piano *****************/
  const piano = useMemo(() => {
    if (showSmartPiano) {
      return (
        <GameSmartPiano
          instrumentPlayer={instrumentPlayer}
          keyWidth={keyboardDimension.keyWidth}
          currentMapping={currentMapping}
          didPlayNote={didPlayNote}
          didStopNote={didStopNote}
        />
      );
    } else {
      return (
        <GameTraditionalPiano
          instrumentPlayer={instrumentPlayer}
          keyboardVolume={keyboardVolume}
          keyboardDimension={keyboardDimension as TraditionalKeyboardDimension}
          playerTrack={playerTrack}
          didPlayNote={didPlayNote}
          didStopNote={didStopNote}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardDimension, currentMapping]);

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
        <GameMiddleView
          timeToStart={timeToStart}
          gameEnd={gameEnd}
          showSmartPiano={showSmartPiano}
          middleBoxDimensions={middleBoxDimensions}
          startTime={startTime}
          lookAheadTime={lookAheadTime}
          keyboardDimension={keyboardDimension}
          playerNotes={playerNotes}
        />
      </div>
      <div className={classes.piano}>{!gameEnd && piano}</div>
    </div>
  );
};

export default GameView;
