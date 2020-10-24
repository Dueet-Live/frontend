import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DuetRoom from '../components/Duet/DuetRoom';

const DuetPlay: React.FC = () => {
  const location = useLocation();
  const maybeRoomId = new URLSearchParams(location.search).get('id');

  // If `id` is not present when this component is mounted, `isCreate` is set to true and not changed
  // to false even if we have an id later.
  // Used to prevent DuetRoom from sending a join room request
  // isCreate is only set to true when maybeRoomId is set to null at some time
  const [isCreate, setIsCreate] = useState(maybeRoomId === null);

  useEffect(() => {
    if (maybeRoomId === null) {
      setIsCreate(true);
    }
  }, [maybeRoomId]);

  return <DuetRoom maybeRoomId={maybeRoomId} isCreate={isCreate} />;
};

export default DuetPlay;
