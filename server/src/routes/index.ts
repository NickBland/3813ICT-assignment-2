import express, { Router } from "express";

///// Import sub-routes here /////
import { healthcheck } from "./healthcheck";

// /api/user/
import { login } from "./api/user/login";
import { users } from "./api/user/users";

export const routes: Router = express.Router(); // Get the router instance

///// Use sub-routes here /////
routes.use(healthcheck);

// /api/user/
routes.use(login);
routes.use(users);
