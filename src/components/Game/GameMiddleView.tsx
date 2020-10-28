import { Typography } from '@material-ui/core';
import React from 'react';
import {
  SmartKeyboardDimension,
  TraditionalKeyboardDimension,
} from '../../types/keyboardDimension';
import { Note, SmartNote } from '../../types/MidiJSON';
import { Dimensions } from '../../utils/useDimensions';
import Waterfall from '../Waterfall';
import GameEndView from './GameEndView';

type Props = {
  timeToStart: number;
  gameEnd: boolean;
  showSmartPiano: boolean; // Unchanged
  middleBoxDimensions: Dimensions;
  startTime: number;
  lookAheadTime: number; // Unchanged
  keyboardDimension: SmartKeyboardDimension | TraditionalKeyboardDimension;
  playerNotes: SmartNote[] | Note[]; // Unchanged
};

const GameMiddleView: React.FC<Props> = props => {
  const {
    timeToStart,
    gameEnd,
    showSmartPiano, // Unchanged
    middleBoxDimensions,
    startTime,
    lookAheadTime, // Unchanged
  } = props;
  if (timeToStart !== 0) {
    return (
      <Typography variant="h1" align="center" color="primary">
        {timeToStart}
      </Typography>
    );
  }

  if (!gameEnd) {
    if (showSmartPiano) {
      return (
        <Waterfall
          waterfallDimension={middleBoxDimensions}
          startTime={startTime}
          lookAheadTime={lookAheadTime}
          keyboardDimension={props.keyboardDimension as SmartKeyboardDimension}
          notes={props.playerNotes as SmartNote[]}
          isSmart={showSmartPiano}
        />
      );
    } else {
      return (
        <Waterfall
          waterfallDimension={middleBoxDimensions}
          startTime={startTime}
          lookAheadTime={lookAheadTime}
          keyboardDimension={
            props.keyboardDimension as TraditionalKeyboardDimension
          }
          notes={props.playerNotes as Note[]}
          isSmart={showSmartPiano}
        />
      );
    }
  }

  return <GameEndView />;
};

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.timeToStart === nextProps.timeToStart &&
    prevProps.gameEnd === nextProps.gameEnd &&
    prevProps.startTime === nextProps.startTime &&
    prevProps.middleBoxDimensions.width ===
      nextProps.middleBoxDimensions.width &&
    prevProps.middleBoxDimensions.height ===
      nextProps.middleBoxDimensions.height
  );
}

export default React.memo(GameMiddleView, areEqual);