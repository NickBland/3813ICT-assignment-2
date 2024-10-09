import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user";
import Group from "../../../models/group";
import Channel from "../../../models/channel";
import "dotenv/config";

export const users: Router = express.Router(); // Export the users router

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

// Get all the users (without password) from the users.json file
users.get("/api/user", verifyToken, async (_req: Request, res: Response) => {
  const db = _req.db;

  if (!db) {
    return res.status(500).send("Database not available");
  }

  const collection = db.collection<User>("users");

  const users = (await collection.find().toArray()) as User[];

  users.forEach((user?: { _id?: string; password?: string }) => {
    delete user?._id; // Remove the _id from the response
    delete user?.password; // Remove the password from the response
  });

  return res.send(users);
});

// Create a new user
users.post("/api/user", verifyToken, async (req: Request, res: Response) => {
  const db = req.db;

  if (!db) {
    return res.status(500).send("Database not available");
  }

  const collection = db.collection<User>("users");

  // Check that all required fields are present
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.email ||
    !req.body.name
  ) {
    return res.status(400).send({ message: "Invalid request" });
  }

  // Check that the username is unique
  const user = await collection.findOne({ username: req.body.username });

  if (user) {
    return res.status(409).send({ message: "Username already exists" });
  }

  // Check that the email is unique
  const email = await collection.findOne({ email: req.body.email });

  if (email) {
    return res.status(409).send({ message: "Email already exists" });
  }

  // Createa a new user object
  const newUser: User = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    name: req.body.name,
    roles: req.body.roles || [],
    groups: req.body.groups || [],
  };

  // Write the new user object to the database
  try {
    await collection.insertOne(newUser);
  } catch (error) {
    return res.status(500).send({ message: "Error creating user", error });
  }

  // Remove the password property from the response
  delete req.body.password;
  req.body.authToken = jwt.sign({ user: req.body }, secret); // Create a JWT token for the user using the updated data
  return res.status(201).send(req.body);
});

// Get a single user by username (without password) from the users.json file
users.get(
  "/api/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const collection = db.collection<User>("users");

    const user = await collection.findOne(
      { username: req.params.username },
      { projection: { password: 0, _id: 0 } } // Exclude password and _id from the response
    );

    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }

    return res.send(user);
  }
);

// Update a user's profile
users.put(
  "/api/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const collection = db.collection<User>("users");

    const user = await collection.findOne({ username: req.params.username });
    const users = await collection.find().toArray();

    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }

    // Check if the user is trying to update their own profile
    // Do this by comparing the username in the JWT token with the username on file.
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload; // TS type assertion since decode returns unknown

    // Check that the username in the JWT token matches the username in the URL
    if (decoded?.user.username !== req.params.username) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Check that the username being updated to is unique (if it is being updated)
    if (
      users.find(
        (user: { username: string }) => user.username === req.body.username
      ) &&
      req.body.username !== user.username
    ) {
      return res.status(409).send({ message: "Username already exists" });
    }

    // Check that the email being updated is unique (if it is being updated)
    if (
      users.find((user: { email: string }) => user.email === req.body.email) &&
      req.body.email !== user.email
    ) {
      return res.status(409).send({ message: "Email already exists" });
    }

    // Create required parameters for the update
    const filter = { username: req.params.username };
    const updatedUser = {
      $set: {
        username: req.body.username || user.username,
        password: req.body.password || user.password,
        email: req.body.email || user.email,
        name: req.body.name || user.name,
        roles: req.body.roles || user.roles,
        groups: req.body.groups || user.groups,
      },
    };
    const options = { upsert: false }; // Do NOT create a new document if it doesn't exist, error instead

    // Write the updated user object back to the database
    try {
      await collection.updateOne(filter, updatedUser, options);
    } catch (error) {
      return res.status(500).send({ message: "Error updating user", error });
    }

    // Get the new user object from the database
    const updated = await collection
      .findOne(
        { username: updatedUser.$set.username },
        { projection: { password: 0, _id: 0 } } // Exclude password and _id from the response
      )
      .then((user) => {
        user!.loggedIn = true; // Add the loggedIn property to the user object
        user!.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
        return user;
      });

    return res.send(updated);
  }
);

// Delete a user by username
users.delete(
  "/api/user/:username",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const collection = db.collection<User>("users");

    const user = await collection.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }

    // Check that the user is trying to delete their own profile, unless they are a superuser who can delete any profile
    // Do this by comparing the username in the JWT token with the username on file.
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload; // TS type assertion since decode returns unknown

    // Perform the checks
    if (
      decoded?.user.username !== req.params.username &&
      !decoded?.user.roles?.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Remove the user object from the database
    try {
      await collection.deleteOne({ username: req.params.username });
    } catch (error) {
      return res.status(500).send({ message: "Error deleting user", error });
    }

    // Remove references to the user from any groups they were a user or admin of
    const groups = db.collection<Group>("groups");
    const channels = db.collection<Channel>("channels");

    // Attempt removal by pulling the user value from the arrays
    try {
      await groups.updateMany(
        {},
        { $pull: { users: req.params.username, admins: req.params.username } }
      );

      await channels.updateMany({}, { $pull: { users: req.params.username } });
    } catch (error) {
      return res.status(500).send({ message: "Error deleting user", error });
    }

    return res.send({
      message: `User '${req.params.username}' successfully deleted`,
    });
  }
);

// Refresh the JWT token for the user
users.patch(
  "/api/user/refresh",
  verifyToken,
  async (req: Request, res: Response) => {
    const db = req.db;

    if (!db) {
      return res.status(500).send("Database not available");
    }

    const collection = db.collection<User>("users");

    const users = await collection
      .find(
        {},
        {
          projection: { password: 0, _id: 0 }, // Exclude password and _id from the response
        }
      )
      .toArray();

    const user = users.find(
      (user: { username: string }) => user.username === req.body.username
    );

    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }

    // Ensure that the user updating the token is the same as the user in the JWT token
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;

    if (decoded?.user.username !== req.body.username) {
      return res.status(403).send({ message: "Forbidden" });
    }

    user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
    return res.send(user);
  }
);
