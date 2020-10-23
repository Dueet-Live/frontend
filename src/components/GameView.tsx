import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import {
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import { Waterfall } from './Waterfall';
import InteractivePiano from './Piano/InteractivePiano';

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
};

const GameView: React.FC<Props> = ({ chosenSongMIDI }) => {
  const classes = useStyles();
  const [timeToStart, setTimeToStart] = useState(3);

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
  const smallStartNote = !tracks ? 72 : tracks[0].smallStartNote;

  const regularStartNote = !tracks ? 72 : tracks[0].regularStartNote;

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
            notes={tracks[0].notes}
          />
        )}
      </div>
      <div className={classes.piano}>
        <InteractivePiano
          includeOctaveShift={false}
          {...keyboardDimension}
          keyHeight={keyHeight}
          keyboardMap={keyboardMap}
          didPlayNote={noOp}
          didStopNote={noOp}
        />
      </div>
    </div>
  );
};

export default GameView;
