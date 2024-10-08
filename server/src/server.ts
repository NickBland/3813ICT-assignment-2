import express, { Express } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { reset, connect } from "./database";

import { routes } from "./routes/index"; // Gather all sub-routes from the index file
import { sockets } from "./sockets/sockets";

const PORT = 8888; // Run server on 8888/8080 for http & 3000/3001 for https

export const app: Express = express();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
const corsMiddleware = cors(corsOptions);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

app.use(express.urlencoded({ extended: true })); // Enable URL parsing middleware
app.use(express.json()); // Enable JSON parsing middleware

///// PREPARE DATABASE /////
connect()
  .then(async (db) => {
    console.log("Connected to the database!");

    ///// RESET DATABASE /////
    if (process.argv.includes("-r")) {
      console.log("\x1b[34m Resetting the database... \x1b[0m");
      await reset(db);
    }

    ///// MIDDLEWARE TO ATTACH DB TO REQUEST /////
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    ///// SOCKET.IO /////
    sockets(io);

    ///// DEFINE & USE ROUTES /////
    app.use("/", corsMiddleware, routes); // Push them to the root URL

    ///// START SERVER /////
    server.listen(PORT, () => {
      console.log("\x1b[32m Express server initialised! \x1b[0m");
      console.log(
        "\x1b[33m Server listening on http://localhost:%s \x1b[0m",
        PORT
      );
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
