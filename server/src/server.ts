import express from "express";

const PORT = 8888; // Run server on 8888/8080 for http & 3000/3001 for https

let app = express();

app.use(express.urlencoded({ extended: true })); // Enable URL parsing middleware
app.use(express.json()); // Enable JSON parsing middleware

///// DEFINE ROUTES /////
app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

///// USE ROUTES /////

///// START SERVER /////
app.listen(PORT, () => {
  console.log("Express server initialised!");
  console.log("Server listening on http://localhost:%s", PORT);
});
