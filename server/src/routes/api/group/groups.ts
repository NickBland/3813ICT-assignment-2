import express, { Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import "dotenv/config";

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
    res.status(400).send({ message: "Invalid Token", error });
  }
}

// Get all the groups from the groups.json file
groups.get("/api/group", verifyToken, (_req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  return res.send(groups);
});

// Create a new group
groups.post("/api/group", (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Check that the group name is unique
  if (
    groups.find(
      (group: { name: string }) => group.name === req.body.name
    )
  ) {
    return res.status(409).send({ message: "Group name already exists" });
  }

  // Add the new group to the groups array
  groups.push(req.body);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send(req.body);
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Update a group by name
groups.put("/api/group/:name", (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Find the group by name
  const group = groups.find(
    (group: { name: string }) => group.name === req.params.name
  );

  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Update the group with the new data
  Object.assign(group, req.body);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send(group);
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Delete a group by name
groups.delete("/api/group/:name", (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Find the group by name
  const groupIndex = groups.findIndex(
    (group: { name: string }) => group.name === req.params.name
  );

  if (groupIndex === -1) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Remove the group from the groups array
  groups.splice(groupIndex, 1);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send({ message: "Group deleted" });
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Get a single group by name from the groups.json file
groups.get("/api/group/:name", verifyToken, (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  const group = groups.find(
    (group: { name: string }) => group.name === req.params.name
  );

  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  return res.send(group);
});

// Add a user to a group
groups.post("/api/group/:name/user", (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Find the group by name
  const group = groups.find(
    (group: { name: string }) => group.name === req.params.name
  );

  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Check that the user is not already in the group
  if (group.users.includes(req.body.username)) {
    return res.status(409).send({ message: "User already in group" });
  }

  // Add the user to the group
  group.users.push(req.body.username);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send(group);
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Remove a user from a group
groups.delete("/api/group/:name/user/:username", (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Find the group by name
  const group = groups.find(
    (group: { name: string }) => group.name === req.params.name
  );

  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Find the user by username
  const userIndex = group.users.findIndex(
    (username: string) => username === req.params.username
  );

  if (userIndex === -1) {
    return res.status(404).send({ message: "User not found in group" });
  }

  // Remove the user from the group
  group.users.splice(userIndex, 1);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send(group);
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});