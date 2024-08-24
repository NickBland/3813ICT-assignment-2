import express, { Request, Response, Router } from "express";

export const healthcheck: Router = express.Router(); // Export the router instance

healthcheck.get("/healthcheck", (req: Request, res: Response) => {
  res.sendStatus(200);
});
