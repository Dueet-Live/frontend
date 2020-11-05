import { makeStyles } from '@material-ui/core';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import { GameContext } from '../../contexts/GameContext';
import { RoomContext, RoomView } from '../../contexts/RoomContext';
import { TraditionalKeyboardDimension } from '../../types/keyboardDimension';
import { Part } from '../../types/messages';
import { MidiJSON } from '../../types/MidiJSON';
import { calculateSmartKeyboardDimension } from '../../utils/calculateSmartKeyboardDimension';
import { calculateTraditionalKeyboardDimensionForGame } from '../../utils/calculateTraditionalKeyboardDimension';
import {
  calculateSongDuration,
  changeSongSpeed,
  getPlaybackNotes,
} from '../../utils/songInfo';
import { useDimensions } from '../../utils/useDimensions';
import InstrumentPlayer from '../Piano/InstrumentPlayer';
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
  showSmartPiano: boolean;
  handleNotePlay?: (key: number, playerId: number) => void;
  handleNoteStop?: (key: number, playerId: number) => void;
  gameStartTime: number;
};

const GameView: React.FC<Props> = ({
  chosenSongMIDI,
  setScore,
  setView,
  speed,
  myPart,
  showSmartPiano,
  handleNotePlay = noOp,
  handleNoteStop = noOp,
  gameStartTime,
}) => {
  const classes = useStyles();

  const gameManagerRef = useRef<GameManager>(
    new GameManager(handleNotePlay, handleNoteStop)
  );
  const { view } = useContext(RoomContext);
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
  const delayedStartTime = lookAheadTime + gameStartTime;

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
    if (gameStartTime === -1) {
      return;
    }

    // Set up game
    const gameManager = gameManagerRef.current;
    gameManager.setUpGame(gameStartTime, lookAheadTime);

    // Schedule countdown
    gameManager.scheduleCountDown(countDown, setTimeToStart);

    // Schedule playback
    const playbackNotes = getPlaybackNotes(tracks, playbackChannel);
    gameManager.schedulePlaybackAudio(instrumentPlayer, playbackNotes);

    // Set up score manager
    gameManager.setUpScoreManager(playerNotes, setScore);
    // Set up feedback manager
    gameManager.setUpFeedbackManager(playerNotes, showSmartPiano);

    // Schedule ending screen
    gameManager.scheduleEndingScreen(songDuration, () => {
      setView(myPart === undefined ? 'solo.play.end' : 'duet.play.end');
    });

    return () => {
      gameManager.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStartTime]);

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
          keyWidth={keyboardDimension.keyWidth}
          normalPlayerNotes={playerNotes}
          startTime={delayedStartTime}
        />
      );
    } else {
      return (
        <GameTraditionalPiano
          keyboardVolume={keyboardVolume}
          keyboardDimension={keyboardDimension as TraditionalKeyboardDimension}
          playerTrack={playerTrack}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardDimension, delayedStartTime]);

  return (
    <div className={classes.root}>
      <ProgressBar
        startTime={gameStartTime}
        delayedStartTime={delayedStartTime}
        songDuration={songDuration}
      />
      <GameContext.Provider value={{ gameManagerRef, instrumentPlayer }}>
        <div ref={middleBoxRef} className={classes.middleBox}>
          <GameMiddleView
            timeToStart={timeToStart}
            gameEnd={gameEnd}
            showSmartPiano={showSmartPiano}
            middleBoxDimensions={middleBoxDimensions}
            startTime={gameStartTime}
            lookAheadTime={lookAheadTime}
            keyboardDimension={keyboardDimension}
            normalPlayerNotes={playerNotes}
          />
        </div>
        <div className={classes.piano}>{!gameEnd && piano}</div>
      </GameContext.Provider>
    </div>
  );
};

function areEqual(prevProps: Props, nextProps: Props) {
  return prevProps.gameStartTime === nextProps.gameStartTime;
}

export default React.memo(GameView, areEqual);
