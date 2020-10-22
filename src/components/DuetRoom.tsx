import {
  Box,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import songsAPI from '../api/songs';
import { Part } from '../types/messages';
import { RoomInfo } from '../types/roomInfo';
import {
  calculateDefaultPianoDimension,
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';
import { getFriendId, getMyPart, getPartsSelection } from '../utils/roomInfo';
import socket, {
  addListeners,
  choosePart,
  createRoom,
  joinRoom,
  playNote,
  removeRoomStateListeners,
  stopNote,
} from '../utils/socket';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import DuetReadyButton from './DuetReadyButton';
import DuetRoomHeader from './DuetRoomHeader';
import InteractivePiano from './InteractivePiano';
import { PartSelection } from './PartSelection';
import { PlayerContext } from './PlayerContext';
import { RoomContext } from './RoomContext';
import { Waterfall } from './Waterfall';

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

  // TODO probably want to refactor these into a single object?
  const [timeToStart, setTimeToStart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chosenSongMIDI, setChosenSongMIDI] = useState<any>({});

  const { piece } = roomState;

  useEffect(() => {
    // connect to ws server
    socket.open();

    addListeners(setPlayerId, setRoomState, setTimeToStart, history);
    return () => {
      removeRoomStateListeners();
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

  const friendId = getFriendId(roomState, playerId);
  const partsSelection = getPartsSelection(roomState);
  const myPart = getMyPart(roomState, playerId);

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
  const SMALL_START_NOTE = !(isPlaying && tracks)
    ? 72
    : tracks[myPart === 'primo' ? 0 : 1].smallStartNote;

  const REGULAR_START_NOTE = !(isPlaying && tracks)
    ? 72
    : tracks[myPart === 'primo' ? 0 : 1].regularStartNote;

  const keyboardDimension = isPlaying
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
  const keyboardMap =
    isPlaying && isDesktopView
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
    if (isPlaying && tracks) {
      // at this point, myPart is definitely either primo or secondo, otherwise
      // game should not have started.
      const notes = tracks[myPart === 'primo' ? 0 : 1].notes;

      return (
        <Waterfall
          {...keyboardDimension}
          dimension={middleBoxDimensions}
          bpm={bpm}
          beatsPerBar={beatsPerBar}
          notes={notes}
          noteDivision={noteDivision}
        />
      );
    }

    if (timeToStart !== 0) {
      return (
        <Typography variant="h1" align="center" color="primary">
          {timeToStart}
        </Typography>
      );
    }

    return (
      <>
        <DuetReadyButton
          className={classes.readyButton}
          isPieceDownloaded={!!tracks}
        />
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
            <DuetRoomHeader isPlaying={isPlaying || timeToStart > 0} />
          </div>

          {/* available space for the rest of the content */}
          <div ref={middleBoxRef} className={classes.box}>
            {middleBox()}
          </div>

          {/* piano */}
          <div className={classes.piano}>
            <InteractivePiano
              includeOctaveShift={!isPlaying}
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
