import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Duet: React.FC = () => {
  const maybeRoomId = new URLSearchParams(useLocation().search).get('id');

  useEffect(() => {
    // connect to ws server

    // only done on first load. All subsequent re-renders should use
    // some state varaible to determine whether to render a room or not
    if (maybeRoomId === null) {
      // tell server to create room.
      // receive roomId from server and join room.
      // update url
    } else {
      // tell server that client wants to join room
      // receive room id and status
    }
  }, []);

  if (maybeRoomId === null) {
    return (
      <>
        <h3>Creating room...</h3>
        <Link to="/">
          <button>Back</button>
        </Link>
      </>
    );
  }

  return (
    <>
      <h3>Duet</h3>

      <Link to="/">
        <button>Back</button>
      </Link>
    </>
  );
};

export default Duet;
