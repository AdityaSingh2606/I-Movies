import { io } from 'socket.io-client';

// Use same host or dev proxy
const SOCKET_URL = window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
