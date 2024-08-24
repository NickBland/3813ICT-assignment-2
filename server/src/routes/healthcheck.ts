import express, { Request, Response, Router } from "express";

const router: Router = express.Router(); // Get the router instance

router.get("", (req: Request, res: Response) => {
  res.sendStatus(200);
});

export default router; // Export the router instance back
