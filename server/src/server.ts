import express, { Express } from "express";
import cors from "cors";
import { createServer } from "http";
import { reset, connect } from "./database";

import { routes } from "./routes/index"; // Gather all sub-routes from the index file

const PORT = 8888; // Run server on 8888/8080 for http & 3000/3001 for https

export const app: Express = express();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
const corsMiddleware = cors(corsOptions);

export const server = createServer(app);

app.use(express.urlencoded({ extended: true })); // Enable URL parsing middleware
app.use(express.json()); // Enable JSON parsing middleware

///// PREPARE DATABASE /////
export async function main() {
  try {
    // Declare URI here to ensure the process.env has a chance to be defined before being used (race condition otherwise)
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017"; // Default to a local MongoDB instance

    const db = await connect(mongoURI);
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
    server.listen(PORT, () => {
      console.log("Express server initialised!");
      console.log("Server listening on http://localhost:%s", PORT);
    });

    return server;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

if (process.env.NODE_ENV !== "test") {
  main().catch(console.error);
}
