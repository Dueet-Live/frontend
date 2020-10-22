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
import useSong from '../utils/useSong';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { RoomContext, RoomView } from './RoomContext';
import SoloRoomHeader from './SoloRoomHeader';
import SoloSelectSong from './SoloSelectSong';
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
    display: 'flex',
    flexDirection: 'column',
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
  const [view, setView] = useState<RoomView>('solo.select');
  const [songSelectionGenre, setSongSelectionGenre] = useState('');

  const { piece } = roomState;
  const chosenSong = useSong(piece);

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

  const middleBox = () => {
    if (view === 'solo.select') {
      return (
        <SoloSelectSong
          genre={songSelectionGenre}
          setGenre={setSongSelectionGenre}
          isPieceDownloaded={!!tracks}
          handleStart={() => {
            setTimeToStart(3);
            setView('solo.play');
          }}
          tryPiano={() => setView('solo.try')}
          chosenSong={chosenSong}
        />
      );
    }

    // if timeToStart is not 0,
    //   hide readybutton, partselection, and parts of room header, show number
    //   show number countdown
    // if timeToStart is 0 and playing, show waterfall, music, etc.
    // if timeToStart is 0 and not playing, show the current stuff
    if (isPlaying && tracks)
      return (
        <Waterfall
          {...keyboardDimension}
          dimension={middleBoxDimensions}
          bpm={bpm}
          beatsPerBar={beatsPerBar}
          noteDivision={noteDivision}
          notes={tracks[0].notes}
        />
      );

    if (view === 'solo.play' && timeToStart !== 0) {
      return (
        <Typography variant="h1" align="center" color="primary">
          {timeToStart}
        </Typography>
      );
    }

    return <></>;
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
          <SoloRoomHeader
            view={view}
            setView={setView}
            selectedGenre={songSelectionGenre}
            setGenre={setSongSelectionGenre}
            quitSong={() => {
              setIsPlaying(false);
              setTimeToStart(0);
              setView('solo.select');
              // TODO update server that user has quit
            }}
          />
        </div>
        {/* available space for the rest of the content */}
        <div ref={middleBoxRef} className={classes.box}>
          {middleBox()}
        </div>

        {/* piano */}
        {view !== 'solo.select' && (
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
        )}
      </Box>
    </RoomContext.Provider>
  );
};

export default SoloRoom;
