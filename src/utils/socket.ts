import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL!, {
  autoConnect: false,
});

export default socket;
