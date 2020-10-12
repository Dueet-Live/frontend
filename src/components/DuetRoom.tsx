import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Part } from '../types/Messages';
import { RoomInfo } from '../types/RoomInfo';
import {
  calculateDefaultPianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
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
import { RoomContext } from './RoomContext';
import RoomHeader from './RoomHeader';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  box: {
    flexGrow: 100,
  },
  header: {
    flexGrow: 0,
  },
  piano: {
    flexGrow: 0,
  },
}));

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

const getPartsSelection = (roomState: RoomInfo) => {
  const primo: number[] = [];
  const secondo: number[] = [];

  const players = roomState.players;
  if (!players) {
    return { primo, secondo };
  }

  for (const player of roomState.players) {
    if (player.assignedPart === 'primo') {
      primo.push(player.id);
    } else if (player.assignedPart === 'secondo') {
      secondo.push(player.id);
    }
  }
  return { primo, secondo };
};

const DuetRoom: React.FC<{ maybeRoomId: string | null; isCreate: boolean }> = ({
  maybeRoomId,
  isCreate,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [roomState, setRoomState] = useState({} as RoomInfo);
  const [playerId, setPlayerId] = useState(-1);

  const { width, height } = useWindowDimensions();
  const keyboardDimension = calculateDefaultPianoDimension(width);
  const keyHeight = calculateKeyHeight(height);

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

  const [middleBoxDimensions, middleBoxRef] = useDimensions<HTMLDivElement>();
  const friendId = getFriendId(roomState, playerId);
  const partsSelection = getPartsSelection(roomState);

  return (
    <RoomContext.Provider
      value={{
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
            {/* TODO: remove this when doing waterfall */}
            {JSON.stringify(middleBoxDimensions)}
            <PartSelection
              primo={partsSelection.primo}
              secondo={partsSelection.secondo}
              didSelect={(part: Part) => {
                choosePart(part);
              }}
            />
          </div>

          {/* piano */}
          <div className={classes.piano}>
            <InteractivePiano
              {...keyboardDimension}
              keyHeight={keyHeight}
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
