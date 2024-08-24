import express, { Router } from "express";

// Import sub-routes here
import { healthcheck } from "./healthcheck";
import { test } from "./api/test";

export const routes: Router = express.Router(); // Get the router instance

// Use sub-routes here
routes.use(healthcheck);
routes.use(test);
