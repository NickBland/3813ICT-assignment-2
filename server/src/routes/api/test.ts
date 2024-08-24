import express, { Request, Response, Router } from "express";

export const test: Router = express.Router(); // Export the router instance

test.get("/api/test", (req: Request, res: Response) => {
  res.sendStatus(200);
});
