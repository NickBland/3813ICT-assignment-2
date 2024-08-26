import express, { Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const login: Router = express.Router(); // Export the login router

login.post("/api/user/login", (req: Request, res: Response) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("Invalid request");
  }

  const receivedData = {
    username: req.body.username,
    password: req.body.password,
  };

  // Create a default secret in case the .env file does not exist
  const secret = process.env.JWT_SECRET || "defaultSecret";

  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  // Check if the user exists and password is correct
  const user = users.find(
    (user: { username: string; password: string }) =>
      user.username === receivedData.username &&
      user.password === receivedData.password
  );

  // If user object does not exist, return 401. Otherwise, return the user data (NOT PASSWORD)
  if (!user) {
    return res.status(401).send({ message: "Incorrect User or Password" });
  } else {
    delete user.password; // Remove the password property from the response
    user.loggedIn = true; // Add the loggedIn property to the user object
    user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user
    return res.send(user);
  }
});
