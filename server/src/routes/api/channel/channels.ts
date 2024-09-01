import express, { Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const channels: Router = express.Router(); // Export the channels router

const secret = process.env.JWT_SECRET || "defaultSecret";

// Create a simple verification middleware function for use in these calls
function verifyToken(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.split(" ")[1]; // Get auth header, remove "Bearer " from the start

  if (!token) {
    return res.status(401).send({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, secret);
    req.body.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ message: "Invalid Token", error });
  }
}

// Get all channel IDs for a given group
// Or get all channels if the group ID is 0
channels.get(
  "/api/channels/:group",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedGroup = Number(req.params.group);

    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

    // Return all channels if the group ID is 0
    if (selectedGroup === 0) {
      const channels = JSON.parse(
        fs.readFileSync("./data/channels.json", "utf-8")
      );
      return res.send(channels);
    }

    // Check if the group exists
    const group = groups.find((group: { id: number }) => {
      return group.id === selectedGroup;
    });

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    return res.send(group.channels);
  }
);

// Get information about a specific channel
channels.get(
  "/api/channel/:channel",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = req.params.channel;

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find((channel: { name: string }) => {
      return channel.name === selectedChannel;
    });

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    return res.send(channel);
  }
);

// Create a new channel for a group
channels.post(
  "/api/channel/:group",
  verifyToken,
  (req: Request, res: Response) => {
    // Create a new channel object from the request body (name, description)
    const newChannel = {
      id: 0,
      name: req.body.name,
      description: req.body.description,
      group: 0,
      users: [] as string[],
      messages: [] as string[],
    };

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel already exists within the group provided
    // Assign all channels that are part of the group to the groupChannels variable
    const groupChannels = channels.filter(
      (channel: { group: number }) => channel.group === Number(req.params.group)
    );

    // Check if the channel already exists within the group
    const channel = groupChannels.find(
      (channel: { name: string }) => channel.name === newChannel.name
    );

    if (channel) {
      return res.status(409).send({ message: "Channel already exists" });
    }

    // Assign the user that created the channel to the channel (from the JWT token)
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload;
    newChannel.users.push(decoded?.user.username);

    // Assign the new channel an ID
    newChannel.id = channels.length ? channels.length + 1 : 1;

    // Check that the group exists
    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));
    const group = groups.find((group: { id: number }) => {
      return group.id === Number(req.params.group);
    });

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Assign the channel to the group (channel-side)
    newChannel.group = Number(req.params.group);

    // And assign the channel to the group (group-side)
    group.channels.push(newChannel.id);

    channels.push(newChannel);

    // Final check to make sure the channel and id are not 0 (something went wrong)
    if (newChannel.id === 0 || newChannel.group === 0) {
      return res.status(500).send({ message: "Error creating channel" });
    }

    try {
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(channels, null, 2)
      );
      fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
      return res.send({ channel: newChannel });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Delete a channel (given a channel ID)
channels.delete(
  "/api/channel/:channelID",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find(
      (channel: { id: number }) => channel.id === selectedChannel
    );

    console.log(channel);

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Remove the channel from the channels list
    const newChannelsList = channels.filter(
      (channel: { id: number }) => channel.id !== selectedChannel
    );

    // Remove the channel from the group
    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));

    // Find the group that the channel belongs to
    const group = groups.find(
      (group: { id: number }) => group.id === channel.group
    );

    // Remove the channel from the group
    group.channels = group.channels.filter(
      (channelId: number) => channelId !== channel.id
    );

    // Update both files
    try {
      fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(newChannelsList, null, 2)
      );
      return res.send({ message: "Channel deleted" });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Update a channel's information (given a channel ID)
channels.put(
  "/api/channel/:channelID",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find(
      (channel: { id: number }) => channel.id === selectedChannel
    );

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Update the channel's information with the new information (only if it's provided)
    if (req.body.name) {
      channel.name = req.body.name;
    }

    if (req.body.description) {
      channel.description = req.body.description;
    }

    // Update the channels file
    try {
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(channels, null, 2)
      );
      return res.send({ channel });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Add a user to a channel (given a channel ID and username)
channels.post(
  "/api/channel/:channelID/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find(
      (channel: { id: number }) => channel.id === selectedChannel
    );

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const user = users.find((user: { username: string }) => {
      return user.username === username;
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Add the user to the channel
    channel.users.push(username);

    // Update the channels file
    try {
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(channels, null, 2)
      );
      return res.send({ message: "User added to channel" });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Remove a user from a channel (given a channel ID and username)
channels.delete(
  "/api/channel/:channelID/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find(
      (channel: { id: number }) => channel.id === selectedChannel
    );

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const user = users.find((user: { username: string }) => {
      return user.username === username;
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Remove the user from the channel
    channel.users = channel.users.filter(
      (channelUser: string) => channelUser !== username
    );

    // Update the channels file
    try {
      fs.writeFileSync(
        "./data/channels.json",
        JSON.stringify(channels, null, 2)
      );
      return res.send({ message: "User removed from channel" });
    } catch (error) {
      return res.status(500).send({ message: "Error writing to file", error });
    }
  }
);

// Get whether a user is in a channel (given a channel ID and username)
channels.get(
  "/api/channel/:channelID/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const selectedChannel = Number(req.params.channelID);
    const username = req.params.username;

    const channels = JSON.parse(
      fs.readFileSync("./data/channels.json", "utf-8")
    );

    // Check if the channel exists
    const channel = channels.find(
      (channel: { id: number }) => channel.id === selectedChannel
    );

    if (!channel) {
      return res.status(404).send({ message: "Channel not found" });
    }

    // Check if the user exists
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const user = users.find((user: { username: string }) => {
      return user.username === username;
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user is in the channel
    const inChannel = channel.users.includes(username);

    return res.send(inChannel);
  }
);
