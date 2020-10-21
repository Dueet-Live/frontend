import {
  Box,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import songsAPI from '../api/songs';
import { RoomInfo } from '../types/roomInfo';
import {
  calculateDefaultPianoDimension,
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { RoomContext } from './RoomContext';
import SoloReadyButton from './SoloReadyButton';
import SoloRoomHeader from './SoloRoomHeader';
import { Waterfall } from './Waterfall';

const noOp = () => {};

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  box: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: '0px',
    position: 'relative',
  },
  header: {
    flexGrow: 0,
  },
  piano: {
    flexGrow: 0,
  },
  readyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}));

const SoloRoom: React.FC = () => {
  const classes = useStyles();

  // TODO need to ensure that roomstate is reset after playing a song
  const [roomState, setRoomState] = useState({
    players: [],
    id: '',
  } as RoomInfo);
  const [timeToStart, setTimeToStart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chosenSongMIDI, setChosenSongMIDI] = useState<any>({});

  const { piece } = roomState;

  useEffect(() => {
    if (timeToStart <= 0) {
      return;
    }

    setTimeout(() => {
      if (timeToStart > 0) {
        setTimeToStart(timeToStart - 1);
      }
      if (timeToStart === 1) {
        setIsPlaying(true);
      }
    }, 1000);
  }, [timeToStart]);

  useEffect(() => {
    if (piece === undefined) return;

    async function fetchSongMIDI() {
      if (piece === undefined) return;
      try {
        const song = await songsAPI.getSongWithContent(piece);

        setChosenSongMIDI(JSON.parse(song.content));
      } catch (err) {
        // TODO set a notification that it failed to retrieve song
        // from server
      }
    }

    fetchSongMIDI();
  }, [piece]);

  // Calculate keyboard dimension
  const tracks = chosenSongMIDI.tracks;
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const { height } = useWindowDimensions();
  const SMALL_START_NOTE = !(isPlaying && tracks)
    ? 72
    : tracks[0].smallStartNote;

  const REGULAR_START_NOTE = !(isPlaying && tracks)
    ? 72
    : tracks[0].regularStartNote;

  const keyboardDimension =
    isPlaying || timeToStart !== 0
      ? calculateGamePianoDimension(
          middleBoxDimensions.width,
          SMALL_START_NOTE,
          REGULAR_START_NOTE
        )
      : calculateDefaultPianoDimension(middleBoxDimensions.width);
  const keyHeight = calculateKeyHeight(height);

  // Get keyboard mapping
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = isDesktopView
    ? getKeyboardMappingWithSpecificStart(
        REGULAR_START_NOTE,
        keyboardDimension['start'],
        keyboardDimension['range']
      )
    : undefined;

  // if timeToStart is not 0,
  //   hide readybutton, partselection, and parts of room header, show number
  //   show number countdown
  // if timeToStart is 0 and playing, show waterfall, music, etc.
  // if timeToStart is 0 and not playing, show the current stuff
  const middleBox = () => {
    if (isPlaying && tracks)
      return (
        <Waterfall
          {...keyboardDimension}
          dimension={middleBoxDimensions}
          bpm={120}
          beatsPerBar={4}
          notes={tracks[0].notes}
        />
      );

    if (timeToStart !== 0) {
      return (
        <Typography variant="h1" align="center" color="primary">
          {timeToStart}
        </Typography>
      );
    }

    return (
      <div className={classes.readyButton}>
        <SoloReadyButton
          handleStart={() => setTimeToStart(3)}
          isPieceDownloaded={!!tracks}
        />
      </div>
    );
  };

  return (
    <RoomContext.Provider
      value={{
        timeToStart: timeToStart,
        isPlaying: isPlaying,
        roomInfo: roomState,
        setRoomInfo: setRoomState,
      }}
    >
      <Box className={classes.root}>
        {/* header */}
        <div className={classes.header}>
          <SoloRoomHeader isPlaying={isPlaying || timeToStart > 0} />
        </div>

        {/* available space for the rest of the content */}
        <div ref={middleBoxRef} className={classes.box}>
          {middleBox()}
        </div>

        {/* piano */}
        <div className={classes.piano}>
          <InteractivePiano
            {...keyboardDimension}
            keyHeight={keyHeight}
            keyboardMap={keyboardMap}
            didPlayNote={noOp}
            didStopNote={noOp}
          />
        </div>
      </Box>
    </RoomContext.Provider>
  );
};

export default SoloRoom;
