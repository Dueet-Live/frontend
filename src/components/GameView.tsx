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
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './Piano/InteractivePiano';
import { Waterfall } from './Waterfall';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  const [timeToStart, setTimeToStart] = useState(3);

  const didPlayNote = (note: number, playedBy: number) => {
    // TODO: update score

    handleNotePlay(note, playedBy);
  };
  const didStopNote = (note: number, playedBy: number) => {
    // TODO: update score

    handleNotePlay(note, playedBy);
  };

  // 0 for solo
  // 0 for primo, 1 for secondo
  let trackNum = 0;
  if (myPart === 'secondo') {
    trackNum = 1;
  }

  useEffect(() => {
    if (timeToStart <= 0) {
      return;
    }

    const handler = setTimeout(() => {
      if (timeToStart > 0) {
        setTimeToStart(timeToStart - 1);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [timeToStart]);

  // song information
  const tracks = chosenSongMIDI.tracks;
  const bpm = chosenSongMIDI.header?.tempos[0].bpm;
  const [beatsPerBar, noteDivision] =
    chosenSongMIDI.header === undefined
      ? [0, 0]
      : chosenSongMIDI.header.timeSignatures[0].timeSignature;

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
    ? getKeyboardMappingWithSpecificStart(
        regularStartNote,
        keyboardDimension['start'],
        keyboardDimension['range']
      )
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
            {...keyboardDimension}
            dimension={middleBoxDimensions}
            bpm={bpm}
            beatsPerBar={beatsPerBar}
            noteDivision={noteDivision}
            notes={tracks[trackNum].notes}
          />
        )}
      </div>
      <div className={classes.piano}>
        <InteractivePiano
          includeOctaveShift={false}
          {...keyboardDimension}
          keyHeight={keyHeight}
          keyboardMap={keyboardMap}
          didPlayNote={didPlayNote}
          didStopNote={didStopNote}
        />
      </div>
    </div>
  );
};

export default GameView;
