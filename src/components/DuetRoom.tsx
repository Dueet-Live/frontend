import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RoomInfo } from '../types/RoomInfo';
import {
  calculateDefaultPianoDimension,
  calculateKeyHeight,
} from '../utils/calculateKeyboardDimension';
import socket, {
  addListeners,
  createRoom,
  joinRoom,
  playNote,
  stopNote,
} from '../utils/socket';
import { useDimensions } from '../utils/useDimensions';
import useWindowDimensions from '../utils/useWindowDimensions';
import InteractivePiano from './InteractivePiano';
import { PlayerContext } from './PlayerContext';
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

  return (
    <PlayerContext.Provider
      value={{
        me: playerId,
        friend: getFriendId(roomState, playerId),
      }}
    >
      <Box className={classes.root}>
        {/* header */}
        <div className={classes.header}>
          <RoomHeader />
        </div>

        {/* available space for the rest of the content */}
        <div ref={middleBoxRef} className={classes.box}>
          {`Width: ${middleBoxDimensions.width}, height = ${middleBoxDimensions.height}`}
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
  );
};

export default DuetRoom;
