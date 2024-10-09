import { Server, Socket } from "socket.io";
import Message from "../models/message";

export const sockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("message", (msg: Message) => {
      console.log("message: " + msg);
      io.emit("chat message", msg);
    });
  });
};
