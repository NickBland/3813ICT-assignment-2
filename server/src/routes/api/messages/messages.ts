import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user";
// import Group from "../../../models/group";
import Channel from "../../../models/channel";
import Message from "../../../models/message";
import "dotenv/config";

export const messages: Router = express.Router(); // Export the message router

const secret = process.env.JWT_SECRET || "defaultSecret";

function verifyToken(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.split(" ")[1]; // Get auth header, remove "Bearer " from the start

  if (!token) {
    return res.status(401).send({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, secret);
    req.body.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ message: "Invalid Token", error });
  }
}

// Get all messages for a channel
messages.get(
  "/api/messages/:channelID",
  verifyToken,
  async (req: Request, res: Response) => {
    const channelID = Number(req.params.channelID);

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const messageCollection = db.collection<Message>("messages");
    const channelCollection = db.collection<Channel>("channels");

    // Confirm that channel exists

    const channel = await channelCollection.findOne({
      id: channelID,
    });

    if (!channel) {
      return res.status(404).send("Channel not found");
    }

    const messages = (await messageCollection
      .find(
        { channel: channelID },
        { sort: { timestamp: 1 }, projection: { _id: 0 } }
      ) // Sort by timestamp and remove _id
      .toArray()) as Message[];

    return res.send(messages);
  }
);

// Get a single message
messages.get(
  "/api/message/:messageID",
  verifyToken,
  async (req: Request, res: Response) => {
    const messageID = Number(req.params.messageID);

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const messageCollection = db.collection<Message>("messages");

    const message = await messageCollection.findOne({
      id: messageID,
    });

    if (!message) {
      return res.status(404).send("Message not found");
    }

    return res.send(message);
  }
);

// Get all messages from a user
messages.get(
  "/api/messages/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const username = req.params.username;

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const messageCollection = db.collection<Message>("messages");
    const userCollection = db.collection<User>("users");

    // Confirm that user exists
    const user = await userCollection.findOne({
      username,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const messages = (await messageCollection
      .find(
        { sender: username },
        { sort: { timestamp: 1 }, projection: { _id: 0 } }
      )
      .toArray()) as Message[];

    return res.send(messages);
  }
);

// Create a new message
messages.post(
  "/api/message",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const messageCollection = db.collection<Message>("messages");
    const channelCollection = db.collection<Channel>("channels");

    // Check that the message has the required fields
    if (!req.body.channel || !req.body.contents) {
      return res.status(400).send("Missing required fields");
    }

    const message = new Message(
      req.body.sender || null,
      req.body.file || false,
      req.body.contents,
      new Date(),
      req.body.channel
    );

    // If there is no sender, attach it to the user making the request via their token
    if (!message.sender) {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.decode(token as string) as jwt.JwtPayload; // TS type assertion since decode returns unknown

      message.sender = decoded?.user.username;
    }

    // Attach a unique ID to the message by fetching the highest ID from the existing messages
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

    // Confirm that the channel exists
    const channel = await channelCollection.findOne({
      id: message.channel,
    });

    if (!channel) {
      return res.status(404).send("Channel not found");
    }

    // Add the message to the database
    await messageCollection.insertOne(message);

    return res.status(201).send(message);
  }
);
