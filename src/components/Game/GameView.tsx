import { makeStyles } from '@material-ui/core';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as Tone from 'tone';
import { Player } from 'tone';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { PlayerContext } from '../../contexts/PlayerContext';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Part } from '../../types/messages';
import { MidiJSON } from '../../types/MidiJSON';
import { calculateSmartKeyboardDimension } from '../../utils/calculateSmartKeyboardDimension';
import { calculateTraditionalKeyboardDimensionForGame } from '../../utils/calculateTraditionalKeyboardDimension';
import { isEqual } from '../../utils/setHelpers';
import { calculateSongDuration, getPlaybackNotes } from '../../utils/songInfo';
import { useDimensions } from '../../utils/useDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import { NullSoundFontPlayerNoteAudio } from '../Piano/InstrumentPlayer/AudioPlayer';
import { changeSongSpeed } from '../utils';
import { calculateLookAheadTime } from '../Waterfall/utils';
import GameMiddleView from './GameMiddleView';
import GameSmartPiano from './GameSmartPiano';
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
  speed: number;
  myPart?: Part | null;
  showSmartPiano?: boolean;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  setScore,
  speed,
  myPart,
  showSmartPiano = true,
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const classes = useStyles();

  // Game start time (after the countdown)
  const [startTime, setStartTime] = useState(-1);
  const [gameEnd, setGameEnd] = useState(false);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);
  const pressedNotes = useRef<Set<number>>(new Set());
  const modifiedMIDI = useMemo(
    () => changeSongSpeed(chosenSongMIDI, speed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // For scoring
  const gameEndRef = useRef(false);
  const prevIndexInMIDI = useRef(0);
  const { me } = useContext(PlayerContext);

  /*************** Song information *****************/
  const { tracks, header } = modifiedMIDI;
  const songDuration = useMemo(
    () => calculateSongDuration(tracks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const lookAheadTime = useMemo(() => {
    return calculateLookAheadTime(header);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Actual start time (including the lookAheadTime(1 bar rest))
  const delayedStartTime = lookAheadTime + startTime;

  /*************** Player track information *****************/
  // 0 for solo
  // 0 for primo, 1 for secondo
  const playerTrackNum = myPart === 'secondo' ? 1 : 0;
  // 1 for solo, 2 for secondo
  const playbackChannel = myPart === undefined ? 1 : 2;
  const playerTrack = tracks[playerTrackNum];
  const playerNotes = playerTrack.notes;

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
          // TODO: this should be done in the JSON file
          note.velocity * 0.5
        );
        handlers.push(handler);
        // Schedule 1 sec before the note play
      }, note.time + delayedStartTime - Tone.now() - 1);
    });

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
        playerNotes,
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

  const didPlayNote = useCallback(
    (note: number, playedBy: number) => {
      if (playedBy === me) {
        pressedNotes.current.add(note);
      }
      handleNotePlay(note, playedBy);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me]
  );

  const didStopNote = useCallback(
    (note: number, playedBy: number) => {
      if (playedBy === me) {
        pressedNotes.current.delete(note);
      }
      handleNoteStop(note, playedBy);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me]
  );

  /*************** Keyboard dimension *****************/
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const keyboardDimension = useMemo(() => {
    const { width } = middleBoxDimensions;
    if (showSmartPiano) {
      return calculateSmartKeyboardDimension(width);
    } else {
      return calculateTraditionalKeyboardDimensionForGame(width, playerTrack);
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
          normalPlayerNotes={playerNotes}
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
          normalPlayerNotes={playerNotes}
        />
      </div>
      <div className={classes.piano}>{!gameEnd && piano}</div>
    </div>
  );
};

export default React.memo(GameView, () => true);
