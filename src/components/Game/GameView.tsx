import { makeStyles } from '@material-ui/core';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { PlayerContext } from '../../contexts/PlayerContext';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Part } from '../../types/messages';
import { MidiJSON } from '../../types/MidiJSON';
import { calculateSmartKeyboardDimension } from '../../utils/calculateSmartKeyboardDimension';
import { calculateTraditionalKeyboardDimensionForGame } from '../../utils/calculateTraditionalKeyboardDimension';
import { calculateSongDuration, getPlaybackNotes } from '../../utils/songInfo';
import { useDimensions } from '../../utils/useDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
import { changeSongSpeed } from '../utils';
import { calculateLookAheadTime } from '../Waterfall/utils';
import GameMiddleView from './GameMiddleView';
import GameSmartPiano from './GameSmartPiano';
import GameTraditionalPiano from './GameTraditionalPiano';
import GameManager from './Logic/GameManager';
import ProgressBar from './ProgressBar';
import { Score } from './types';

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

  const gameManager = useRef<GameManager>(new GameManager());
  const { me } = useContext(PlayerContext);

  // Game start time (after the countdown)
  const [startTime, setStartTime] = useState(-1);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);
  const [gameEnd, setGameEnd] = useState(false);

  /*************** Song information *****************/
  const modifiedMIDI = useMemo(
    () => changeSongSpeed(chosenSongMIDI, speed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
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
    // Set up game
    const currentGameManager = gameManager.current;
    currentGameManager.setUpGame(
      setStartTime,
      lookAheadTime,
      countDown,
      handleNotePlay,
      handleNoteStop
    );

    // Schedule countdown
    currentGameManager.scheduleCountDown(countDown, setTimeToStart);

    // Schedule playback
    const playbackNotes = getPlaybackNotes(tracks, playbackChannel);
    currentGameManager.schedulePlaybackAudio(instrumentPlayer, playbackNotes);

    // Set up score manager
    currentGameManager.setUpScoreManager(playerNotes, setScore);

    // Schedule ending screen
    currentGameManager.scheduleEndingScreen(songDuration, setGameEnd);

    return () => {
      currentGameManager.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Callbacks *****************/
  const didPlayNote = useCallback(
    (note: number, playedBy: number) => {
      gameManager.current.handleNotePlay(note, playedBy, me);
    },
    [me]
  );

  const didStopNote = useCallback(
    (note: number, playedBy: number) => {
      gameManager.current.handleNoteStop(note, playedBy, me);
    },
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
      <ProgressBar
        startTime={startTime}
        delayedStartTime={delayedStartTime}
        songDuration={songDuration}
      />
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
