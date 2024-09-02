import express, { Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const users: Router = express.Router(); // Export the users router

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

// Get all the users (without password) from the users.json file
users.get("/api/user", verifyToken, (_req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  users.forEach((user?: { password?: string }) => {
    delete user?.password; // Remove the password from the response
  });

  return res.send(users);
});

// Create a new user
users.post("/api/user", (req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  // Check that the username and email are unique
  if (
    users.find(
      (user: { username: string }) => user.username === req.body.username
    )
  ) {
    return res.status(409).send({ message: "Username already exists" });
  }

  if (users.find((user: { email: string }) => user.email === req.body.email)) {
    return res.status(409).send({ message: "Email already exists" });
  }

  // Add the new user to the users array
  users.push(req.body);

  // Write the updated users array back to the file
  try {
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
  } catch (error) {
    return res.status(500).send({ message: "Error creating user", error });
  }

  // Remove the password property from the response
  delete req.body.password;
  req.body.authToken = jwt.sign({ user: req.body }, secret); // Create a JWT token for the user using the updated data
  return res.send(req.body);
});

// Get a single user by username (without password) from the users.json file
users.get("/api/user/:username", verifyToken, (req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  const user = users.find(
    (user: { username: string }) => user.username === req.params.username
  );

  if (!user) {
    return res.status(404).send({ message: "User not Found" });
  }

  delete user.password; // Remove the password from the response
  return res.send(user);
});

// Update a user's profile
users.put("/api/user/:username", verifyToken, (req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  const user = users.find(
    (user: { username: string }) => user.username === req.params.username
  );

  if (!user) {
    return res.status(404).send({ message: "User not Found" });
  }

  // Check if the user is trying to update their own profile
  // Do this by comparing the username in the JWT token with the username on file.
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.decode(token as string) as jwt.JwtPayload; // TS type assertion since decode returns unknown

  // Check that the username in the JWT token matches the username in the URL
  if (decoded?.user.username !== req.params.username) {
    return res.status(403).send({ message: "Forbidden" });
  }

  // Check that the username being updated is unique (if it is being updated)
  if (
    users.find(
      (user: { username: string }) => user.username === req.body.username
    ) &&
    req.body.username !== user.username
  ) {
    return res.status(409).send({ message: "Username already exists" });
  }

  // Check that the email being updated is unique (if it is being updated)
  if (
    users.find((user: { email: string }) => user.email === req.body.email) &&
    req.body.email !== user.email
  ) {
    return res.status(409).send({ message: "Email already exists" });
  }

  // Overwrite the user object with the new data, not adding any new properties
  // (Some new properties like iat and exp are added by the JWT token)
  // Also ensure that the user object is not overwritten with empty data
  Object.keys(req.body).forEach((key) => {
    if (Object.keys(user).includes(key) && req.body[key] !== "") {
      user[key] = req.body[key];
    }
  });

  // Overwrite the user object in the users array
  const index = users.findIndex(
    (user: { username: string }) => user.username === req.params.username
  );
  users[index] = user;

  // Write the updated users array back to the file
  try {
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
  } catch (error) {
    return res.status(500).send({ message: "Error updating user", error });
  }

  delete user.password; // Remove the password property from the response
  user.loggedIn = true; // Add the loggedIn property to the user object
  user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
  return res.send(user);
});

// Delete a user by username
users.delete(
  "/api/user/:username",
  verifyToken,
  (req: Request, res: Response) => {
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

    const user = users.find(
      (user: { username: string }) => user.username === req.params.username
    );

    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }

    // Check that the user is trying to delete their own profile, unless they are a superuser who can delete any profile
    // Do this by comparing the username in the JWT token with the username on file.
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token as string) as jwt.JwtPayload; // TS type assertion since decode returns unknown

    // Perform the checks
    if (
      decoded?.user.username !== req.params.username &&
      !decoded?.user.roles?.includes("super")
    ) {
      return res.status(403).send({ message: "Forbidden" });
    }

    // Remove the user object from the users array
    const index = users.findIndex(
      (user: { username: string }) => user.username === req.params.username
    );
    users.splice(index, 1);

    // Remove the user from any groups they were a user or admin of
    // If there are then no users in a group, the super user will be added
    const groups = JSON.parse(fs.readFileSync("./data/groups.json", "utf-8"));
    groups.forEach((group: { users: string[]; admins: string[] }) => {
      const userIndex = group.users.indexOf(req.params.username);
      if (userIndex !== -1) {
        group.users.splice(userIndex, 1);
        if (group.users.length === 0) {
          group.users.push("super");
        }
      }

      const adminIndex = group.admins.indexOf(req.params.username);
      if (adminIndex !== -1) {
        group.admins.splice(adminIndex, 1);
        if (group.admins.length === 0) {
          group.admins.push("super");
        }
      }
    });

    // Write the updated users array back to the file
    try {
      fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
      fs.writeFileSync("./data/groups.json", JSON.stringify(groups, null, 2));
    } catch (error) {
      return res.status(500).send({ message: "Error deleting user", error });
    }

    return res.send({
      message: `User '${req.params.username}' successfully deleted`,
    });
  }
);

// Refresh the JWT token for the user
users.patch("/api/user/refresh", verifyToken, (req: Request, res: Response) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  // Ensure that the user updating the token is the same as the user in the JWT token
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.decode(token as string) as jwt.JwtPayload;

  if (decoded?.user.username !== req.body.username) {
    return res.status(403).send({ message: "Forbidden" });
  }

  const user = users.find(
    (user: { username: string }) => user.username === req.body.username
  );

  if (!user) {
    return res.status(404).send({ message: "User not Found" });
  }

  delete user.password; // Remove the password property from the response
  user.authToken = jwt.sign({ user: user }, secret); // Create a JWT token for the user using the updated data
  return res.send(user);
});
