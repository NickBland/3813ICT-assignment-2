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
groups.post("/api/group", verifyToken, (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  // Check that the group name is unique
  if (groups.find((group: { name: string }) => group.name === req.body.name)) {
    return res.status(409).send({ message: "Group name already exists" });
  }

  // Assign an ID to the new group
  const id = groups.length ? groups.length + 1 : 1;
  req.body.id = id;

  // Add the user creating the group to the group as both an admin and a user
  // Fetch the user from the token
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.decode(token as string) as jwt.JwtPayload;

  // Update the users.json file with the new group
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
  const user = users.find(
    (user: { username: string }) => user.username === decoded?.user.username
  );

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  user.groups.push(req.body.name);
  user.roles.push(id + "-admin");

  // Update the group to contain the user as both an admin and user, and an empty messages array
  req.body.users = [decoded?.user.username];
  req.body.admins = [decoded?.user.username];
  req.body.channels = [] as string[];

  // And remove the user property from the request body
  delete req.body.user;

  // Add the new group to the groups array
  groups.push(req.body);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
    delete user.password; // Remove the password property from the response
    user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
    return res.send({ group: req.body, authToken: user.authToken });
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Update a group by ID
groups.put("/api/group/:id", verifyToken, (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));
  let groupId: number;

  // Find the group by ID
  try {
    groupId = Number(req.params.id);
  } catch (error) {
    return res.status(400).send({ message: "Invalid group ID", error });
  }
  const group = groups.find((group: { id: number }) => group.id === groupId);

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
    groups.find((group: { name: string }) => group.name === req.body.name) &&
    req.body.name !== group.name
  ) {
    return res.status(409).send({ message: "Group name already exists" });
  }

  // Check that the ID is not being updated
  if (req.body.id && req.body.id !== group.id) {
    return res.status(409).send({ message: "Cannot update group ID" });
  }

  // Overwrite the group object with the new data, not adding any new properties
  // Also ensure that the group object is not overwritten with empty data
  Object.keys(req.body).forEach((key) => {
    if (Object.keys(group).includes(key) && req.body[key] !== "") {
      group[key] = req.body[key];
    }
  });

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    return res.send(group);
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Delete a group by id
groups.delete("/api/group/:id", verifyToken, (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  let groupId: number;

  // Find the group by name
  try {
    groupId = Number(req.params.id);
  } catch (error) {
    return res.status(400).send({ message: "Invalid group ID", error });
  }
  const groupIndex = groups.findIndex(
    (group: { id: number }) => group.id === groupId
  );

  if (groupIndex === -1) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Check that the user is an admin of the group, or a super user
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.decode(token as string) as jwt.JwtPayload;

  if (
    !decoded?.user.roles.includes(req.params.id + "-admin") &&
    !decoded?.user.roles.includes("super")
  ) {
    console.log(req.params.id + "-admin");
    return res.status(403).send({ message: "Forbidden" });
  }

  // Update the users.json file with by removing references to the group from ALL users
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
  users.forEach((user: { groups: string[]; roles: string[] }) => {
    console.log(user.groups, user.roles);
    const gIndex = user.groups.indexOf(groups[groupIndex].name);
    if (gIndex !== -1) {
      user.groups.splice(gIndex, 1);
    }

    const roleIndex = user.roles.indexOf(req.params.id + "-admin");
    if (roleIndex !== -1) {
      user.roles.splice(roleIndex, 1);
    }
    console.log(user.groups, user.roles);
    console.log(gIndex, roleIndex);
  });

  // Update the channels.json file by removing orphaned channels
  const channels = JSON.parse(fs.readFileSync("./data/channels.json", "utf-8"));
  channels.forEach((channel: { group: number }, index: number) => {
    if (channel.group === groupId) {
      channels.splice(index, 1);
    }
  });

  // Remove the group from the groups array
  groups.splice(groupIndex, 1);

  // Write the updated groups array back to the file
  try {
    fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
    fs.writeFileSync("./data/channels.json", JSON.stringify(channels, null, 2));
    return res.send({
      message: `Group '${req.params.id}' successfully deleted`,
    });
  } catch (error) {
    return res.status(500).send({ message: "Error writing to file", error });
  }
});

// Get a single group by id from the groups.json file
groups.get("/api/group/:id", verifyToken, (req: Request, res: Response) => {
  const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

  let groupId: number;

  // Find the group by ID
  try {
    groupId = Number(req.params.id);
  } catch (error) {
    return res.status(400).send({ message: "Invalid group ID", error });
  }
  const group = groups.find((group: { id: number }) => group.id === groupId);

  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  return res.send(group);
});

// Add a user to a group
groups.post(
  "/api/group/:id/user/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

    let groupID: number;

    // Find the group by ID
    try {
      groupID = Number(req.params.id);
    } catch (error) {
      return res.status(400).send({ message: "Invalid group ID", error });
    }
    const group = groups.find((group: { id: number }) => group.id === groupID);

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

    // Update the users.json file with the new group
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const user = users.find(
      (user: { username: string }) => user.username === req.params.username
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.groups.push(group.name);

    // Write the updated groups array back to the file
    try {
      fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
      fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
      delete user.password; // Remove the password property from the response
      user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
      return res.send({ group: group, authToken: user.authToken });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Remove a user from a group given the ID and username
groups.delete(
  "/api/group/:id/user/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const groupID = Number(req.params.id);
    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

    // Find the group by name
    const group = groups.find(
      (group: { id: number; name: string }) => group.id === groupID
    );

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

    // Find the user by username
    const userIndex = group.users.findIndex(
      (username: string) => username === req.params.username
    );

    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found in group" });
    }

    // Remove the user from the group (group side)
    group.users.splice(userIndex, 1);

    // Update the users.json file by removing references to the group from the user
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    users.forEach(
      (user: { username: string; groups: string[]; roles: string[] }) => {
        if (user.username === req.params.username) {
          console.log(user);
          const groupIndex = user.groups.indexOf(group.name);
          if (groupIndex !== -1) {
            user.groups.splice(groupIndex, 1);
          }

          const roleIndex = user.roles.indexOf(group.id + "-admin");
          if (roleIndex !== -1) {
            user.roles.splice(roleIndex, 1);
          }
        }
      }
    );

    // Update the channels.json file by removing references to the user from channels in the group
    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );
    channels.forEach((channel: { group: number; users: string[] }) => {
      if (channel.group === groupID) {
        const userIndex = channel.users.indexOf(req.params.username);
        if (userIndex !== -1) {
          channel.users.splice(userIndex, 1);
        }
      }
    });

    // Write the updated groups array back to the file
    try {
      fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
      fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(channels, null, 2)
      );
      return res.send({ message: "User removed from group" });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);
