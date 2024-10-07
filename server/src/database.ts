// Prepare the MongoDB environment by ensuring that the database exists
// and that the necessary collections are created.

import { Db, MongoClient } from "mongodb";

// MongoDB connection string
const url = "mongodb://localhost:27017";

// Database name
const dbName = "chatmeup";

// Collection names
const collections = ["users", "groups", "channels", "messages"];

// Connect to MongoDB
export const connect = async () => {
  try {
    const client = new MongoClient(url);
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

    console.log("Database reset successfully!");
  } catch (error) {
    console.error("Failed to reset the database:", error);
    throw error;
  }
};
