import express, { Request, Response, Router } from "express";

export const healthcheck: Router = express.Router(); // Export the router instance

healthcheck.get("/healthcheck", (req: Request, res: Response) => {

  const db = req.db;

  if (!db) {
    return res.status(500).send("Database not available");
  } else {
    res.sendStatus(200);
  }
});
