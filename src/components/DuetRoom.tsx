import { Box, Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { RoomInfo } from '../types/RoomInfo';
import {
  calculateDefaultPianoDimension,
  calculateGamePianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import socket, {
  addListeners,
  createRoom,
  joinRoom,
  playNote,
  stopNote,
} from '../utils/socket';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { PlayerContext } from './PlayerContext';
import { RoomContext } from './RoomContext';
import RoomHeader from './RoomHeader';
import { Waterfall } from './Waterfall';
import { SamplePiece } from './Waterfall/sample';
import { Note } from './Waterfall/types';
import { getKeyboardMappingWithSpecificStart } from '../utils/getKeyboardShorcutsMapping';

const useStyles = makeStyles(theme => ({
  piano: {
    position: 'absolute',
    bottom: 0,
  },
}));

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [roomState, setRoomState] = useState({} as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);

  const { width, height } = useWindowDimensions();
  // Before game start, use `calculateDefaultPianoDimension(width)
  const keyboardDimension = calculateGamePianoDimension(width, 60, 60);
  const keyHeight = calculateKeyHeight(height);
  const getFriendId = (roomState: RoomInfo, myId: number) => {
    const players = roomState.players;
    if (!players) {
      return null;
    }
    const friendInfo = players.filter(player => player.id !== myId);
    if (friendInfo.length === 0) {
      return null;
    } else {
      return friendInfo[0].id;
    }
  };
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));
  // 60 is the regular start note
  const keyboardMap = isDesktopView
    ? getKeyboardMappingWithSpecificStart(
        60,
        keyboardDimension['start'],
        keyboardDimension['range']
      )
    : undefined;

  // TODO: remove this
  const piece = JSON.parse(SamplePiece);
  const notes: Array<Note> = piece.notes; // TODO: get the right notes

  useEffect(() => {
    // connect to ws server
    socket.open();

    addListeners(setPlayerId, setRoomState, history);

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

  return (
    <>
      <RoomContext.Provider
        value={{
          roomInfo: roomState,
          setRoomInfo: setRoomState,
        }}
      >
        <PlayerContext.Provider
          value={{
            me: playerId,
            friend: getFriendId(roomState, playerId),
          }}
        >
          <Box display="flex" flexDirection="column" height="100%">
            <RoomHeader />
            <Waterfall
              {...keyboardDimension}
              bpm={120} // TODO: customise
              beatsPerBar={4}
              smallStartNote={60}
              regularStartNote={60}
              notes={notes}
            />
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
          </Box>
        </PlayerContext.Provider>
      </RoomContext.Provider>
    </>
  );
};

export default DuetRoom;
