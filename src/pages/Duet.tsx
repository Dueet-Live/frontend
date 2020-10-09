import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DuetRoom from '../components/DuetRoom';

const Duet: React.FC = () => {
  const location = useLocation();
  const maybeRoomId = new URLSearchParams(location.search).get('id');

  // Used to prevent DuetRoom from sending a join room request
  // isCreate is only set to true when maybeRoomId is set to null at some time
  // this takes advantage of how the only way to join a room is by opening
  // a link (full page reload), whereas there is no restriction to creating a room.
  const [isCreate, setIsCreate] = useState(maybeRoomId === null);

  useEffect(() => {
    if (maybeRoomId === null) {
      setIsCreate(true);
    }
  }, [maybeRoomId]);

  return <DuetRoom maybeRoomId={maybeRoomId} isCreate={isCreate} />;
};

export default Duet;
