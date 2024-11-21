import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_BASE_URL,{
    transports: ["websocket"], })
export let socketID = '';
socket.on('connect', () => {
    socketID = socket.id
})