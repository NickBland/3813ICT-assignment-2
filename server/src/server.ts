import express, { Express } from "express";
import cors from "cors";
import { reset, connect } from "./database";

import { routes } from "./routes/index"; // Gather all sub-routes from the index file

const PORT = 8888; // Run server on 8888/8080 for http & 3000/3001 for https

export const app: Express = express();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
const corsMiddleware = cors(corsOptions);

app.use(express.urlencoded({ extended: true })); // Enable URL parsing middleware
app.use(express.json()); // Enable JSON parsing middleware

///// PREPARE DATABASE /////
connect()
  .then(async (db) => {
    console.log("Connected to the database!");

    ///// RESET DATABASE /////
    await reset(db);

    ///// MIDDLEWARE TO ATTACH DB TO REQUEST /////
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    ///// DEFINE & USE ROUTES /////
    app.use("/", corsMiddleware, routes); // Push them to the root URL

    ///// START SERVER /////
    app.listen(PORT, () => {
      console.log("Express server initialised!");
      console.log("Server listening on http://localhost:%s", PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
