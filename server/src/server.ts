import express, { Express } from "express";

const PORT = 8888; // Run server on 8888/8080 for http & 3000/3001 for https

const app: Express = express();

app.use(express.urlencoded({ extended: true })); // Enable URL parsing middleware
app.use(express.json()); // Enable JSON parsing middleware

///// DEFINE ROUTES /////
import healthcheck from "./routes/healthcheck"; // Simple Healthcheck route, returns 200 OK on GET request

///// USE ROUTES /////
app.use("/healthcheck", healthcheck);

///// START SERVER /////
app.listen(PORT, () => {
  console.log("Express server initialised!");
  console.log("Server listening on http://localhost:%s", PORT);
});
