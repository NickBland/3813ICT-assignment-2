import { MongoMemoryServer } from "mongodb-memory-server";
import { main, server } from "../src/server";

let mongoServer: MongoMemoryServer;

exports.mochaHooks = {
  beforeAll: async function () {
    console.log("\x1b[33m-----PREPARING TEST ENVIRONMENT-----\x1b[0m");

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;

    console.log(process.env.MONGO_URI);

    await main();
  },
  afterAll: async function () {
    console.log("\x1b[33m-----CLOSING TEST ENVIRONMENT-----\x1b[0m");

    await mongoServer.stop();
    server.close();
  },
};
