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
import { RoomContext, RoomView } from '../../contexts/RoomContext';
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
  setScore: (score: React.SetStateAction<Score>) => void;
  setView: (view: RoomView) => void;
  speed: number;
  myPart?: Part | null;
  showSmartPiano?: boolean;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  setScore,
  setView,
  speed,
  myPart,
  showSmartPiano = true,
  handleNotePlay = noOp,
  handleNoteStop = noOp,
}) => {
  const classes = useStyles();

  const gameManagerRef = useRef<GameManager>(new GameManager());
  const { me } = useContext(PlayerContext);
  const { view } = useContext(RoomContext);

  // Game start time (after the countdown)
  const [startTime, setStartTime] = useState(-1);
  const countDown = 3;
  const [timeToStart, setTimeToStart] = useState(countDown);
  const gameEnd = view.includes('play.end');

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
    const gameManager = gameManagerRef.current;
    gameManager.setUpGame(
      setStartTime,
      lookAheadTime,
      countDown,
      handleNotePlay,
      handleNoteStop
    );

    // Schedule countdown
    gameManager.scheduleCountDown(countDown, setTimeToStart);

    // Schedule playback
    const playbackNotes = getPlaybackNotes(tracks, playbackChannel);
    gameManager.schedulePlaybackAudio(instrumentPlayer, playbackNotes);

    // Set up score manager
    gameManager.setUpScoreManager(playerNotes, setScore);
    // Set up feedback manager
    gameManager.setUpFeedbackManager(playerNotes);

    // Schedule ending screen
    gameManager.scheduleEndingScreen(songDuration, () => {
      setView(myPart === undefined ? 'solo.play.end' : 'duet.play.end');
    });

    return () => {
      gameManager.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************** Callbacks *****************/
  const didPlayNote = useCallback(
    (note: number, playedBy: number) => {
      gameManagerRef.current.handleNotePlay(note, playedBy, me);
    },
    [me]
  );

  const didStopNote = useCallback(
    (note: number, playedBy: number) => {
      gameManagerRef.current.handleNoteStop(note, playedBy, me);
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
          gameManagerRef={gameManagerRef}
          instrumentPlayer={instrumentPlayer}
          keyWidth={keyboardDimension.keyWidth}
          normalPlayerNotes={playerNotes}
          didPlayNote={didPlayNote}
          didStopNote={didStopNote}
          startTime={delayedStartTime}
        />
      );
    } else {
      // TODO: show feedback for traditional piano as well
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
