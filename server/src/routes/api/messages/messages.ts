import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user";
import Group from "../../../models/group";
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

messages.get(
  "/api/messages/",
  verifyToken,
  async (req: Request, res: Response) => {
    res.send("Messages endpoint");
  }
);
