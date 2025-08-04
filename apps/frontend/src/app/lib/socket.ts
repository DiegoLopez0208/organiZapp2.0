import { io, type Socket } from "socket.io-client";

export const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL as string, {
  transports: ["websocket"],
});
export let socketID = "";
socket.on("connect", () => {
  socketID = socket.id;
});
