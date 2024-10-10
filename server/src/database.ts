// Prepare the MongoDB environment by ensuring that the database exists
// and that the necessary collections are created.

import { Db, MongoClient } from "mongodb";

// Database name
const dbName = "chatmeup";

// Collection names
const collections = ["users", "groups", "channels", "messages"];

// Connect to MongoDB
export const connect = async (mongoURI: string) => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();

    const db = client.db(dbName);

    // Create collections if they don't exist
    await Promise.all(
      collections.map(async (collection) => {
        const exists = await db.listCollections({ name: collection }).hasNext();
        if (!exists) {
          await db.createCollection(collection);
        }
      })
    );

    // Check if the super user exists, if not, reset the database
    const userCollection = db.collection("users");
    const superUser = await userCollection.findOne({ username: "super" });

    if (!superUser) {
      console.log("\x1b[43m Malformed database, resetting... \x1b[0m");
      await reset(db);
    }

    return db;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
};

// Reset the database to an initial state containing a super user, a group, and a channel
export const reset = async (db: Db) => {
  try {
    // Drop all collections
    await Promise.all(
      collections.map(async (collection) => {
        await db.collection(collection).drop();
      })
    );

    // Create a super user
    await db.collection("users").insertOne({
      username: "super",
      password: "123",
      email: "super@super.com",
      name: "Super Admin",
      roles: ["super"],
      groups: ["Group 1"],
    });

    // Create a regular user (Joe)
    await db.collection("users").insertOne({
      username: "joe",
      password: "123",
      email: "joe@email.com",
      name: "Joe",
      roles: [],
      groups: ["Group 1"],
    });

    // Create a group
    await db.collection("groups").insertOne({
      id: 1,
      name: "Group 1",
      description: "Description 1!",
      users: ["super", "joe"],
      admins: ["super"],
      channels: [1, 2],
    });

    // Create 2 channels
    await db.collection("channels").insertOne({
      id: 1,
      name: "General",
      description: "General discussion",
      group: 1,
      users: ["super"],
      messages: [],
    });

    await db.collection("channels").insertOne({
      id: 2,
      name: "Random",
      description: "Random discussion",
      group: 1,
      users: ["super"],
      messages: [],
    });

    // Create a single message from super
    await db.collection("messages").insertOne({
      sender: "super",
      file: false,
      contents: "Hello, World!",
      timestamp: new Date(),
      channel: 1,
      id: 1, // Manually assign an ID as this is the first message
    });

    console.log("\x1b[42m Database reset successfully! \x1b[0m");
  } catch (error) {
    console.error("Failed to reset the database:", error);
    throw error;
  }
};
