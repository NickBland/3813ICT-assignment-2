import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user";
import Group from "../../../models/group";
import Channel from "../../../models/channel";
import "dotenv/config";

export const channels: Router = express.Router(); // Export the channels router

const secret = process.env.JWT_SECRET || "defaultSecret";

// Create a simple verification middleware function for use in these calls
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

// Get all channel IDs for a given group
// Or get all channels if the group ID is 0
channels.get(
  "/api/channels/:group",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const selectedGroup = Number(req.params.group);

    const groups = db.collection<Group>("groups");
    const channelCollection = db.collection<Channel>("channels");

    // Return all channels if the group ID is 0
    if (selectedGroup === 0) {
      const channels = (await channelCollection.find().toArray()) as Channel[];
      return res.send(channels);
    }

    // Check if the group exists
    const group = (await groups.findOne({
      id: selectedGroup,
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    return res.send(group.channels);
  }
);

// Get information about a specific channel given the channel ID
channels.get(
  "/api/channel/:channel",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const selectedChannel = Number(req.params.channel);

    const collection = db.collection<Channel>("channels");

    // Check if the channel exists
    const channel = (await collection.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    return res.send(channel);
  }
);

// Create a new channel for a group
channels.post(
  "/api/channel/:group",
  verifyToken,
  async (req: Request, res: Response) => {
    // Create a new channel object from the request body (name, description)
    const newChannel = new Channel(
      req.body.name,
      req.body.description,
      0,
      [] as string[],
      [] as []
    );

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const channelCollection = db.collection<Channel>("channels");
    const groupCollection = db.collection<Group>("groups");

    // Check if the group exists
    const group = (await groupCollection.findOne({
      id: Number(req.params.group),
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Check if the channel already exists within the group provided
    // Assign all channels that are part of the group to the groupChannels variable
    const channel = (await channelCollection.findOne({
      name: newChannel.name,
      group: Number(req.params.group),
    })) as Channel;

    if (channel) {
      return res.status(409).send({ message: "Channel already exists" });
    }

    // Assign the user that created the channel to the channel (from the JWT token)
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;
    newChannel.users!.push(decoded?.user.username);

    // Assign the new channel an ID by finding the $max of the id field and adding 1
    const channels = await channelCollection
      .find({}, { projection: { _id: 0, id: 1 } }) // Select only the id field
      .sort({ id: -1 }) // Sort in descending order
      .limit(1); // Only return the first value (the highest id)

    // If there are no channels, set the id to 1
    if (!(await channels.hasNext())) {
      newChannel.id = 1;
    } else {
      // Otherwise, set the id to the highest id + 1
      newChannel.id = (await channels.next())!.id! + 1;
    }

    // Assign the channel to the group (channel-side)
    newChannel.group = Number(req.params.group);

    // Attempt to write the changes back to the database
    try {
      await channelCollection.insertOne(newChannel); // Add the new channel

      // Update the group to include the new channel
      group.channels.push(newChannel.id!);
      await groupCollection.updateOne(
        { id: Number(req.params.group) },
        { $set: { channels: group.channels } }
      );

      return res.send({ channel: newChannel });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Delete a channel (given a channel ID)
channels.delete(
  "/api/channel/:channelID",
  verifyToken,
  async (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const channelCollection = db.collection<Channel>("channels");
    const groupCollection = db.collection<Group>("groups");

    // Check if the channel exists
    const channel = (await channelCollection.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Get the group that the channel is part of
    const group = (await groupCollection.findOne({
      id: channel.group,
    })) as Group;
    group.channels = group.channels.filter((id) => id !== selectedChannel);

    // Attempt to write changes to the database
    try {
      // Remove the channel from the database
      await channelCollection.deleteOne({ id: selectedChannel });

      // Remove the channel from the group
      await groupCollection.updateOne(
        { id: group.id },
        { $set: { channels: group.channels } }
      );

      return res.send({ message: "Channel deleted" });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Update a channel's information (given a channel ID)
channels.put(
  "/api/channel/:channelID",
  verifyToken,
  async (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const channelCollection = db.collection<Channel>("channels");

    // Check if the channel exists
    const channel = (await channelCollection.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Fetch all channels from the group
    const channels = await channelCollection
      .find({ group: channel.group })
      .toArray();

    // Check if the new name is already in use
    const nameExists = channels.some(
      (channel: Channel) => channel.name === req.body.name
    );

    if (nameExists) {
      return res.status(409).send({ message: "Channel name already in use" });
    }

    // Update the channel's information with the new information (only if it's provided)
    if (req.body.name) {
      channel.name = req.body.name;
    }

    if (req.body.description) {
      channel.description = req.body.description;
    }

    // Update the database to reflect changes
    try {
      await channelCollection.updateOne(
        { id: selectedChannel },
        { $set: { name: channel.name, description: channel.description } }
      );
      return res.send({ channel });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Add a user to a channel (given a channel ID and username)
channels.post(
  "/api/channel/:channelID/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const channels = db.collection<Channel>("channels");
    const users = db.collection<User>("users");

    // Check if the channel exists
    const channel = (await channels.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const user = (await users.findOne({
      username: username,
    })) as User;

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user is already in the channel
    if (channel.users?.includes(username)) {
      return res.status(409).send({ message: "User already in channel" });
    }

    // Check if the user is part of the group that the channel is in
    const groups = db.collection<Group>("groups");
    const group = (await groups.findOne({
      id: channel.group,
    })) as Group;

    if (!group.users.includes(username)) {
      return res.status(403).send({ message: "User not in group" });
    }

    // Add the user to the channel
    channel.users!.push(username);

    // Update the database
    try {
      await channels.updateOne(
        { id: selectedChannel },
        { $set: { users: channel.users } }
      );
      return res.send({ message: "User added to channel" });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Remove a user from a channel (given a channel ID and username)
channels.delete(
  "/api/channel/:channelID/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const channels = db.collection<Channel>("channels");
    const users = db.collection<User>("users");

    // Check if the channel exists
    const channel = (await channels.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const user = (await users.findOne({
      username: username,
    })) as User;

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user is in the channel
    if (!channel.users?.includes(username)) {
      return res.status(404).send({ message: "User not in channel" });
    }

    // Remove the user from the channel
    channel.users = channel.users?.filter((user) => user !== username);

    // Update the database
    try {
      await channels.updateOne(
        { id: selectedChannel },
        { $set: { users: channel.users } }
      );
      return res.send({ message: "User removed from channel" });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Get whether a user is in a channel (given a channel ID and username)
channels.get(
  "/api/channel/:channelID/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database");
    }

    const channels = db.collection<Channel>("channels");
    const users = db.collection<User>("users");

    // Check if the channel exists
    const channel = (await channels.findOne({
      id: selectedChannel,
    })) as Channel;

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const user = (await users.findOne({
      username: username,
    })) as User;

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user is in the channel
    const inChannel = channel.users!.includes(username);

    return res.send(inChannel);
  }
);
