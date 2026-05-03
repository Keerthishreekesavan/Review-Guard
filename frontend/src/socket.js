import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, { 
  autoConnect: false,
  transports: ['websocket'],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000
});

// GLOBAL MONITOR: Log everything the socket does
socket.on('connect', () => console.log('[Socket Global] Connected! ID:', socket.id));
socket.on('disconnect', (reason) => console.log('[Socket Global] Disconnected:', reason));
socket.onAny((event, ...args) => console.log(`[Socket Global] RECEIVED: "${event}"`, args));

export default socket;
