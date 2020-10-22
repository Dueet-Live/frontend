import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { noOp } from 'tone/build/esm/core/util/Interface';
import {
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import { RoomContext } from '../contexts/RoomContext';
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
  tracks: any;
};

const GameView: React.FC<Props> = ({ tracks }) => {
  const classes = useStyles();

  const { timeToStart } = useContext(RoomContext);

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
            bpm={120}
            beatsPerBar={4}
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
