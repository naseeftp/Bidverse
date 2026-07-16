import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;
let socket: ReturnType<typeof io> | null = null;

export const getSocket = (userId?: string, role?: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/socket',
      withCredentials: true,
      autoConnect: false,
      auth: {
        userId,
        role,
      }
    })

  }
  return socket
}
export const connectSocket = (userId: string, role: string): void => {
  const s = getSocket(userId, role);
  if (s.connected) {
    return
  }
  s.off('connect')//It strips away any old, leftover connection listeners from that socket wire before attaching a fresh one.
  s.once('connect', () => {
    s.emit('user:online', userId)
  })
  s.connect()

}

export const disconnectsSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null
  }
}