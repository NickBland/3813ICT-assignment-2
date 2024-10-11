import { Server, Socket } from "socket.io";
import Message from "../models/message";
import { Db } from "mongodb";

//Define channel characteristics
interface socketUser {
  socketID: string;
  username: string;
  channel: string;
}
const users = [] as socketUser[];

function userJoin(socketID: string, username: string, channel: string) {
  const user = { socketID, username, channel };
  users.push(user);
  return user;
}

function retrieveOnlineUsers(channel: string) {
  return users.filter((user) => user.channel === channel);
}

function userLeave(socketID: string) {
  const index = users.findIndex((user) => user.socketID === socketID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

export const sockets = (io: Server, db: Db) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");

    // Join the user to a room based on their channel
    socket.on("joinchannel", (username, channel) => {
      const user = userJoin(socket.id, username, channel); // Add the user to the users array
      const room = `channel-${user.channel}`;
      socket.join(room);
      io.to(room).emit("user joined", user.username);
      io.to(room).emit("online users", retrieveOnlineUsers(user.channel));
      console.log(`${user.username} joined channel ${user.channel}`);
    });

    // Handle cases where user has simply left the channel
    socket.on("leavechannel", () => {
      const user = userLeave(socket.id);
      if (user) {
        socket.leave(`channel-${user.channel}`);
        io.to(`channel-${user.channel}`).emit("user left", user.username);
        io.to(`channel-${user.channel}`).emit(
          "online users",
          retrieveOnlineUsers(user.channel)
        );
        console.log(`${user.username} left channel ${user.channel}`);
      }
    });

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(`channel-${user.channel}`).emit("user left", user.username);
        io.to(`channel-${user.channel}`).emit(
          "online users",
          retrieveOnlineUsers(user.channel)
        );
        console.log(`${user.username} left channel ${user.channel}`);
      }
    });

    socket.on("message", async (contents) => {
      contents = contents.contents; // Get the actual data from the contents object
      // Validate message contents
      if (
        !contents ||
        typeof contents.contents !== "string" ||
        contents.contents.trim() === ""
      ) {
        console.error("Invalid message contents");
        socket.emit("error", "Invalid message contents");
        return;
      }

      // Create a new message object
      const message = new Message(
        contents.sender,
        contents.file || false,
        contents.contents,
        new Date(),
        contents.channel
      );

      // Attach a unique ID to the message by fetching the highest ID from the existing messages
      const messageCollection = db.collection<Message>("messages");

      const highestID = await messageCollection
        .find({}, { projection: { _id: 0, id: 1 } }) // Select only the id field
        .sort({ id: -1 }) // Sort in descending order
        .limit(1); // Only return the first value (the highest id)

      // If there are no messages, set the id to 1
      if (!(await highestID.hasNext())) {
        message.id = 1;
      } else {
        // Otherwise, set the id to the highest id + 1
        message.id = (await highestID.next())!.id! + 1;
      }

      // Save the message to the database
      try {
        await messageCollection.insertOne(message);

        // Emit the message to the specific room (channel)
        io.to(`channel-${message.channel}`).emit("message", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", "Error saving message");
      }
    });
  });
};
