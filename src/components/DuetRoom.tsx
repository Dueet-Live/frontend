import {
  Box,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Part } from '../types/Messages';
import { RoomInfo } from '../types/RoomInfo';
import {
  calculateDefaultPianoDimension,
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { getFriendId, getPartsSelection } from '../utils/roomInfo';
import socket, {
  addListeners,
  choosePart,
  createRoom,
  joinRoom,
  playNote,
  stopNote,
} from '../utils/socket';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { PartSelection } from './PartSelection';
import { PlayerContext } from './PlayerContext';
import ReadyButton from './ReadyButton';
import { RoomContext } from './RoomContext';
import RoomHeader from './RoomHeader';
import { Waterfall } from './Waterfall';
import { SamplePiece } from './Waterfall/sample';
import { Note } from './Waterfall/types';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  box: {
    flexGrow: 100,
    position: 'relative',
  },
  header: {
    flexGrow: 0,
  },
  piano: {
    flexGrow: 0,
  },
  readyButton: {
    // TODO remove absolute spacing (and find better positioning)
    position: 'absolute',
    left: theme.spacing(2),
    top: theme.spacing(6),
  },
}));

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const classes = useStyles();
  const history = useHistory();

  // TODO need to ensure that roomstate is reset after playing a song
  const [roomState, setRoomState] = useState({
    players: [],
    id: '',
  } as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);
  const [timeToStart, setTimeToStart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // connect to ws server
    socket.open();

    addListeners(setPlayerId, setRoomState, setTimeToStart, history);
    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (maybeRoomId === null) {
      createRoom();
      setPlayerId(-1);
    } else if (!isCreate) {
      joinRoom(maybeRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maybeRoomId]);

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

  const friendId = getFriendId(roomState, playerId);
  const partsSelection = getPartsSelection(roomState);

  // Calculate keyboard dimension
  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  console.log(
    `DuetRoom width ${middleBoxDimensions.width} and height ${middleBoxDimensions.height}`
  );
  const { height } = useWindowDimensions();
  const TEST_SMALL_START_NOTE = 72;
  const TEST_REGULAR_START_NOTE = 72;
  const keyboardDimension =
    isPlaying || timeToStart !== 0
      ? calculateGamePianoDimension(
        middleBoxDimensions.width,
        TEST_SMALL_START_NOTE,
        TEST_REGULAR_START_NOTE
      )
      : calculateDefaultPianoDimension(middleBoxDimensions.width);
  const keyHeight = calculateKeyHeight(height);

  // Get keyboard mapping
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  const keyboardMap = (isPlaying || timeToStart !== 0) && isDesktopView
    ? getKeyboardMappingWithSpecificStart(
      TEST_REGULAR_START_NOTE,
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
    const piece = JSON.parse(SamplePiece);
    const notes: Array<Note> = piece.notes; // TODO: get the right notes

    if (isPlaying)
      return (
        <Waterfall
          {...keyboardDimension}
          dimension={middleBoxDimensions}
          bpm={120}
          beatsPerBar={4}
          notes={notes}
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
      <>
        <ReadyButton className={classes.readyButton} />
        <PartSelection
          primo={partsSelection.primo}
          secondo={partsSelection.secondo}
          didSelect={(part: Part) => {
            choosePart(part);
          }}
        />
      </>
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
      <PlayerContext.Provider
        value={{
          me: playerId,
          friend: friendId,
        }}
      >
        <Box className={classes.root}>
          {/* header */}
          <div className={classes.header}>
            <RoomHeader />
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
              didPlayNote={(note, playedBy) => {
                if (playerId === playedBy) {
                  playNote(note);
                }
              }}
              didStopNote={(note, playedBy) => {
                if (playerId === playedBy) {
                  stopNote(note);
                }
              }}
            />
          </div>
        </Box>
      </PlayerContext.Provider>
    </RoomContext.Provider>
  );
};

export default DuetRoom;
