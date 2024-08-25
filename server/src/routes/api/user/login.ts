import express, { Request, Response, Router } from "express";
import fs from "fs";

export const login: Router = express.Router(); // Export the login router

login.post("/api/user/login", (req: Request, res: Response) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("Invalid request");
  }

  const receivedData = {
    username: req.body.username,
    password: req.body.password,
  };

  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  // Check if the user exists and password is correct
  const user = users.find(
    (user: { username: string; password: string }) =>
      user.username === receivedData.username &&
      user.password === receivedData.password
  );

  // If user does not exist, return 401. Otherwise, return the user data (NOT PASSWORD)
  if (!user) {
    return res.status(401).send({ valid: false });
  } else {
    delete user.password; // Remove the password from the response
    return res.send(user);
  }
});
