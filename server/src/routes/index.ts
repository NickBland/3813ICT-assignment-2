import express, { Router } from "express";

///// Import sub-routes here /////
import { healthcheck } from "./healthcheck";

// /api/
import { login } from "./api/user/login";
import { users } from "./api/user/users";
import { groups } from "./api/group/groups";
import { channels } from "./api/channel/channels";
import { messages } from "./api/messages/messages";

export const routes: Router = express.Router(); // Get the router instance

///// Use sub-routes here /////
routes.use(healthcheck);

// /api/user/
routes.use(login);
routes.use(users);
routes.use(groups);
routes.use(channels);
routes.use(messages);
