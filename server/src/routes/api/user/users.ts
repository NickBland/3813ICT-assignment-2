import express, { Request, Response, Router } from "express";
import fs from "fs";

export const users: Router = express.Router(); // Export the users router

// Get all the users (without password) from the users.json file

users.get("/api/user/users", (_req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  users.forEach((user?: { password?: string }) => {
    delete user?.password; // Remove the password from the response
  });

  return res.send(users);
});

// Get a single user by username (without password) from the users.json file
users.get("/api/user/users/:username", (req: Request, res: Response) => {
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
