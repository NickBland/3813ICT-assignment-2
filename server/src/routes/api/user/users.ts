import express, { Request, Response, Router } from "express";
import fs from "fs";

import jwt from "jsonwebtoken";
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
    res.status(400).send({ message: "Invalid Token", error });
  }
}

// Get all the users (without password) from the users.json file
users.get("/api/user", verifyToken, (_req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  users.forEach((user?: { password?: string }) => {
    delete user?.password; // Remove the password from the response
  });

  return res.send(users);
});

// Get a single user by username (without password) from the users.json file
users.get("/api/user/:username", verifyToken, (req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  const user = users.find(
    (user: { username: string }) => user.username === req.params.username
  );

  if (!user) {
    return res.status(404).send("User not found");
  }

  delete user.password; // Remove the password from the response
  return res.send(user);
});
