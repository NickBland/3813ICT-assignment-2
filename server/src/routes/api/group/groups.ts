import express, { Request, Response, Router } from "express";
import User from "../../../models/user";
import Group from "../../../models/group";
import Channel from "../../../models/channel";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Message from "../../../models/message";

export const groups: Router = express.Router(); // Export the groups router

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
    res.status(401).send({ message: "Invalid Token", error });
  }
}

// Get all the groups from the groups.json file
groups.get("/api/group", verifyToken, async (_req: Request, res: Response) => {
  const db = _req.db;

  if (!db) {
    return res.status(500).send("Database not available");
  }

  const collection = db.collection<Group>("groups");

  const groups = (await collection.find().toArray()) as Group[];

  return res.send(groups);
});

// Create a new group
groups.post("/api/group", verifyToken, async (req: Request, res: Response) => {
  const db = req.db;

  if (!db) {
    return res.status(500).send("Database not available");
  }

  const groupCollection = db.collection<Group>("groups");
  const userCollection = db.collection<User>("users");

  // Check that all required fields are present
  if (!req.body.name || !req.body.description) {
    return res.status(400).send("Invalid request");
  }

  // Check that the group name is unique
  const group = (await groupCollection.findOne({
    name: req.body.name,
  })) as Group;

  if (group) {
    return res.status(409).send({ message: "Group name already exists" });
  }

  // Create new group object
  const newGroup = new Group(
    0,
    req.body.name,
    req.body.description,
    [] as string[],
    [] as string[],
    [] as number[]
  );

  // Assign an ID to the new group by fetching the highest ID from the existing groups
  const highestID = await groupCollection
    .find({}, { projection: { _id: 0, id: 1 } }) // Select only the id field
    .sort({ id: -1 }) // Sort in descending order
    .limit(1); // Only return the first value (the highest id)

  // If there are no channels, set the id to 1
  if (!(await highestID.hasNext())) {
    newGroup.id = 1;
  } else {
    // Otherwise, set the id to the highest id + 1
    newGroup.id = (await highestID.next())!.id! + 1;
  }

  // Add the user creating the group to the group as both an admin and a user
  // Fetch the user from the token
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.decode(token as string) as jwt.JwtPayload;

  // Update the user to contain the new group
  const user = (await userCollection.findOne(
    { username: decoded?.user.username },
    { projection: { password: 0, _id: 0 } } // Exclude password and _id from the response
  )) as User;

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  // Add the group to the user's groups
  user.groups.push(newGroup.name);
  user.roles.push(newGroup.id + "-admin");

  // Update the group to contain the user as both an admin and user, and an empty messages array
  newGroup.users = [decoded?.user.username];
  newGroup.admins = [decoded?.user.username];

  // Attempt to write the changes to the database
  try {
    await groupCollection.insertOne(newGroup);
    await userCollection.updateOne(
      { username: decoded?.user.username },
      { $set: { groups: user.groups, roles: user.roles } }
    );

    user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
    return res.send({ group: newGroup, authToken: user.authToken });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error writing to database", error });
  }
});

// Update a group by ID
groups.put(
  "/api/group/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    // Find the group by ID
    const groupCollection = db.collection<Group>("groups");
    const userCollection = db.collection<User>("users");

    const group = (await groupCollection.findOne({
      id: Number(req.params.id),
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Check that the user is an admin of the group, or a super user
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;

    if (
      !decoded?.user.roles.includes(req.params.id + "-admin") &&
      !decoded?.user.roles.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Check that the group name is unique (if it is being updated)
    if (
      req.body.name &&
      req.body.name !== group.name &&
      (await groupCollection.findOne({ name: req.body.name }))
    ) {
      return res.status(409).send({ message: "Group name already exists" });
    }

    // Update the group object with the new data
    const oldname = group.name;
    if (req.body.name) {
      group.name = req.body.name;
    }

    if (req.body.description) {
      group.description = req.body.description;
    }

    // Attempt to write the changes to the database
    try {
      await groupCollection.updateOne(
        { id: group.id },
        { $set: { name: group.name, description: group.description } }
      );

      // If a user is a member of the updated group, update their groups array
      await userCollection.updateMany(
        { groups: oldname },
        { $set: { "groups.$": group.name } }
      );

      return res.send(group);
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Delete a group by id
groups.delete(
  "/api/group/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const groupCollection = db.collection<Group>("groups");
    const userCollection = db.collection<User>("users");
    const channelCollection = db.collection<Channel>("channels");
    const messageCollection = db.collection<Message>("messages");

    // Find the group by ID
    const group = (await groupCollection.findOne({
      id: Number(req.params.id),
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Check that the user is an admin of the group, or a super user
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;

    if (
      !decoded?.user.roles.includes(req.params.id + "-admin") &&
      !decoded?.user.roles.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Write the changes to the database
    try {
      await groupCollection.deleteOne({ id: group.id });
      await channelCollection.deleteMany({ group: group.id });
      await userCollection.updateMany(
        {},
        { $pull: { groups: group.name, roles: group.id + "-admin" } }
      );

      // For each of the channels in the group.channels, delete all messages
      await messageCollection.deleteMany({ channel: { $in: group.channels } });

      return res.send({
        message: `Group '${req.params.id}' successfully deleted`,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Get a single group by id
groups.get(
  "/api/group/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const groupCollection = db.collection<Group>("groups");

    // Find the group by ID
    const group = (await groupCollection.findOne({
      id: Number(req.params.id),
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    return res.send(group);
  }
);

// Add a user to a group
groups.post(
  "/api/group/:id/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const groupID = Number(req.params.id);

    const groups = db.collection<Group>("groups");
    const users = db.collection<User>("users");

    // Find the group by ID
    const group = (await groups.findOne({
      id: groupID,
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Check that the user is an admin of the group, or a super user
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;

    if (
      !decoded?.user.roles.includes(groupID + "-admin") &&
      !decoded?.user.roles.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Check that the user is not already in the group
    if (group.users.includes(req.params.username)) {
      return res.status(409).send({ message: "User already in group" });
    }

    // Add the user to the group (group side)
    group.users.push(req.params.username);

    // Get the user
    const user = (await users.findOne({
      username: req.params.username,
    })) as User;

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update the user's groups to contain the new group
    user.groups.push(group.name);

    // Write the updated groups array back to the database
    try {
      await groups.updateOne(
        { id: group.id },
        { $set: { users: group.users } }
      );

      await users.updateOne(
        { username: user.username },
        { $set: { groups: user.groups } }
      );

      user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
      return res.send({ group: group, authToken: user.authToken });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);

// Remove a user from a group given the ID and username
groups.delete(
  "/api/group/:id/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const groupID = Number(req.params.id);

    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const groups = db.collection<Group>("groups");
    const users = db.collection<User>("users");
    const channels = db.collection<Channel>("channels");

    // Find the group by ID
    const group = (await groups.findOne({
      id: groupID,
    })) as Group;

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    const user = (await users.findOne({
      username: req.params.username,
    })) as User;

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check that the user is an admin of the group, or a super user
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;

    if (
      !decoded?.user.roles.includes(groupID + "-admin") &&
      !decoded?.user.roles.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Check that the user is in the group
    if (!group.users.includes(req.params.username)) {
      return res.status(409).send({ message: "User not in group" });
    }

    // Remove the user from the group (group side)
    group.users = group.users.filter(
      (username: string) => username !== req.params.username
    );

    // Update the user by removing the group from their groups
    user.groups = user.groups.filter(
      (userGroup: string) => userGroup !== group.name
    );

    // Also update the admin roles if the user is an admin of the group
    user.roles = user.roles.filter(
      (role: string) => role !== groupID + "-admin"
    );

    // Write the updated groups array back to the database
    try {
      await groups.updateOne(
        { id: group.id },
        { $set: { users: group.users } }
      );

      await users.updateOne(
        { username: user.username },
        { $set: { groups: user.groups, roles: user.roles } }
      );

      // Remove the user from all channels in the group
      await channels.updateMany(
        { group: groupID },
        { $pull: { users: req.params.username } }
      );

      return res.send({ message: "User removed from group" });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error writing to database", error });
    }
  }
);
