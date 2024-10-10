import { Server, Socket } from "socket.io";
import Message from "../models/message";
import { Db } from "mongodb";

export const sockets = (io: Server, db: Db) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("message", async (contents) => {
      console.log("message: " + contents);

      // Do nothing if the message is empty
      if (!contents) {
        socket.emit("error", "Empty Message!"); // Emit an error event to JUST the client (not everyone)
        return;
      }

      // Return if necessary fields are missing
      if (!contents.channel || !contents.contents || !contents.sender) {
        socket.emit("error", "Missing fields!");
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

        io.emit("new message", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", "Error saving message");
      }
    });
  });
};
