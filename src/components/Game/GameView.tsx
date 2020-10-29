import { makeStyles } from '@material-ui/core';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Player } from 'tone';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { PlayerContext } from '../../contexts/PlayerContext';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Part } from '../../types/messages';
import { MidiJSON, Note } from '../../types/MidiJSON';
import { calculateSongDuration, getPlaybackNotes } from '../../utils/songInfo';
import { calculateSmartKeyboardDimension } from '../../utils/calculateSmartKeyboardDimension';
import { calculateTraditionalKeyboardDimensionForGame } from '../../utils/calculateTraditionalKeyboardDimension';
import { isEqual } from '../../utils/setHelpers';
import { useDimensions } from '../../utils/useDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import { NullSoundFontPlayerNoteAudio } from '../Piano/InstrumentPlayer/AudioPlayer';
import {
  calculateLookAheadTime,
  getIndexedNotesFromNotes,
} from '../Waterfall/utils';
import GameMiddleView from './GameMiddleView';
import GameSmartPiano from './GameSmartPiano';
import { getIndexToNotesMap } from '../Piano/utils/getKeyToNotesMap';
import { MappedNote } from '../Piano/types/mappedNote';
import { IndexedNote } from '../Waterfall/types';
import GameTraditionalPiano from './GameTraditionalPiano';
import ProgressBar from './ProgressBar';
import { Score } from './types';
import getNotesAtTimeFromNotes from './utils/getNotesAtTimeFromNotes';

const useStyles = makeStyles(() => ({
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
  setScore: (update: (prevScore: Score) => Score) => void;
  myPart?: Part | null;
  showSmartPiano?: boolean;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  setScore,
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
  const pressedNotes = useRef<Set<number>>(new Set());

  // For scoring
  const gameEndRef = useRef(false);
  const prevIndexInMIDI = useRef(0);
  const { me } = useContext(PlayerContext);

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
  const indexToNotesMap: MappedNote[][] = useMemo(
    () => getIndexToNotesMap(normalPlayerNotes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  console.log(indexToNotesMap[6]);

  const playerNotes = useMemo<Note[] | IndexedNote[]>(() => {
    if (showSmartPiano) {
      return getIndexedNotesFromNotes(normalPlayerNotes);
    } else {
      return normalPlayerNotes;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Initialise instrument *****************/
  // TODO: schedule change (if have time), now take the first value only
  const keyboardVolume = normalPlayerNotes[0].velocity;
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

    // Schedule countdown
    for (let i = 0; i < countDown; i++) {
      Tone.Transport.schedule(() => {
        setTimeToStart(countDown - 1 - i);
      }, startTime - (countDown - 1 - i) - Tone.now());
    }

    // Schedule ending screen
    Tone.Transport.schedule(() => {
      setGameEnd(true);
      gameEndRef.current = true;
    }, delayedStartTime + songDuration - Tone.now() + 0.1);

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

    // Score update
    const scoreHandler = setInterval(() => {
      // stop updating score if game has ended
      if (gameEndRef.current) {
        clearInterval(scoreHandler);
        return;
      }

      // game has not started, so don't increment score yet
      if (Tone.now() - delayedStartTime < 0) {
        return;
      }

      const currentlyPressed = new Set(pressedNotes.current);

      // get set of notes that should be pressed right now from playerNotes
      // we use refs here to reduce computation workload during each callback
      const [correctNotes, index] = getNotesAtTimeFromNotes(
        Tone.now() - delayedStartTime,
        normalPlayerNotes,
        prevIndexInMIDI.current
      );

      // if both sets of notes are equal
      setScore((prevScore: Score) => ({
        correct:
          prevScore.correct + (isEqual(currentlyPressed, correctNotes) ? 1 : 0),
        total: prevScore.total + 1,
      }));
      prevIndexInMIDI.current = index;
    }, 500);

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      handlers.forEach(handler => {
        handler.stop();
      });
      clearInterval(scoreHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Callbacks *****************/

  const didPlayNote = (note: number, playedBy: number) => {
    if (playedBy === me) {
      pressedNotes.current.add(note);
    }
    handleNotePlay(note, playedBy);
  };

  const didStopNote = (note: number, playedBy: number) => {
    if (playedBy === me) {
      pressedNotes.current.delete(note);
    }
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
          indexToNotesMap={indexToNotesMap}
          didPlayNote={didPlayNote}
          didStopNote={didStopNote}
          startTime={delayedStartTime}
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
  }, [keyboardDimension, delayedStartTime]);

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
