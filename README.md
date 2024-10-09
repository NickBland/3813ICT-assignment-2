# Chat me Up

[![wakatime](https://wakatime.com/badge/github/NickBland/3813ICT-assignment-1.svg?style=flat)](https://wakatime.com/badge/github/NickBland/3813ICT-assignment-1)

Chat me up is my implementation of the 3813ICT Assignment.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [1.0 - Prelude](#10---prelude)
  - [1.1 - Phase 1](#11---phase-1)
  - [1.2 - Phase 2](#12---phase-2)
- [2.0 - About this Git Repository](#20---about-this-git-repository)
  - [2.1 - Installation/Usage](#21---installationusage)
- [3.0 - Data Structures](#30---data-structures)
  - [3.1 - In General](#31---in-general)
  - [3.2 - Edge Cases and Looking Forward](#32---edge-cases-and-looking-forward)
- [4.0 - Angular Architecture](#40---angular-architecture)
  - [4.1 - Components](#41---components)
  - [4.2 - Services](#42---services)
  - [4.3 - Models](#43---models)
  - [4.4 - Guards](#44---guards)
  - [4.5 - Routes](#45---routes)
- [5.0 - Node Server Architecture](#50---node-server-architecture)
  - [5.1 - Modules](#51---modules)
  - [5.2 - Functions](#52---functions)
  - [5.3 - Files](#53---files)
  - [5.4 - Global Variables](#54---global-variables)
- [6.0 - Server-Side Routes](#60---server-side-routes)
- [7.0 - Testing](#70---testing)

<!-- /code_chunk_output -->

## 1.0 - Prelude

The overall plan for this assignment is to create a chatting up, not dissimilar to Discord or Skype. While it may seem like a large task overall, the assignment has been seperated in to two phases.

### 1.1 - Phase 1

Phase 1 consists of documenting design choices and frameworking the basics of the application, without delving too heavily in to the meat of the application. In this phase, documentation will be key, as well as some idea of how data is to be stored in Phase 2. This phase also looks at constructing the underlying API, and a bespoke user interface to match.

### 1.2 - Phase 2

Phase 2 consists of making the app more than just a wrapper for an API. In this section, a MongoDB database will be implemented based off the data-design choices made in [Phase 1](#11---phase-1). Additionally, some more interesting features, including sockets for real time text-chat, PeerJS for video chat, images for users, etc, are to be implemented.

---

## 2.0 - About this Git Repository

This git repo has been set up as a clone of the [Phase 1 assignment](https://github.com/NickBland/3813ICT-assignment-1) I completed earlier. For development, I made the conscious decision to lock the [Main Branch](https://github.com/NickBland/3813ICT-assignment-2/tree/main) down, and to use a [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). By working in this manner, the main branch should always be in a 'working' state, with breaking changes and brand new features warranting their own branch for testing and development before being merged.

### 2.1 - Installation/Usage

1. Clone the repo with `git clone https://github.com/NickBland/3813ICT-assignment-2.git assignment-2`.
2. Enter the repo with `cd assignment-2`.
3. Initialise the node modules for both the server and frontend with `npm i && cd server && npm i && cd ..`.
4. Serve the application with `npm start`, and you should be able to access it at [http://localhost:4200](http://localhost:4200).

---

## 3.0 - Data Structures

Being a chat application, there is a lot of data that needs to be stored. The requirements for the application have laid out what each piece of data should look like, and below is how I plan to structure this data within my implementation.

### 3.1 - In General

Generally, my plan is to utilise JSON with classes and objects to represent classes. At the base leve, Angular allows classes to be generated for use as interfaces in the rest of the application, allowing for type-safety and reducing the likelihood of dealing with null values. This will be ever-more-important when a database is implemented in Phase 2.

Another benefit of using this form of structure is the large amount of both documentation and support frameworks and browsers have for transmitting and receiving data with JSON. There is no point inventing another way to transmit data when something as ubiquitous as JSON exists.

### 3.2 - Edge Cases and Looking Forward

Of course, while this is all when and good for text-based data, there will need to be some other way to handle image data later on in Phase 2, as well as using PeerJS for video chat. While that is some time away, it is important to think and understand *now* that these different forms of data require an alternate solution to what I have planned above.

---

## 4.0 - Angular Architecture

Using the Angular framework provides ample opportunity to lay out the application in a modular form, with the ability to pass data between various components.

### 4.1 - Components

Components should be made for most of the objects that will be displayed on screen. This includes components for forms, profiles, each channel, each group. Each route on the front end corresponds to a component in Angular. In addition to that, some more components will need to be made for other areas of the frontend that require data or state management. The navbar is the most prime example of this, updating to reflect routes an individual user as buttons despite not being accessible in an individual route (it will be present on every page at the top).

### 4.2 - Services

Where data is being fetched or saved from the API, a service will need to be used. While components are used to render the data, keeping fetching and saving away from the rendering process allows for more re-usability within the codebase. This also allows components to be smaller in size and focus solely on rendering the information from these services on screen.

Services will be created for users, groups, channels, and messages. In addition, an auth service will need to be made to handle authentication between the various pages.

Of particular note is the messages service which handles the connection to the socket server. This service will be used to send and receive messages in real time, and will be used to update the messages in the chat window as they come in. This is very important, as using sockets within an Angular component can become difficult to manage, especially between states (e.g. for notifications when viewing someone's profile page, a regular API request would require constant pings to see for updates, AND require the user to actually be on the messages page to see them).

### 4.3 - Models

The objects I mentioned earlier in [Section 3.1](#31---in-general) should be stored as Models within Angular. These can easily be imported when needed through the project and serve as a centralised way to house the data structure. This also allows for ample documentation to be added during the creation of them, making for easier development.

There will be models for the different data structures to be used: including users, groups, and channels. In the future, a message model will need to be created

### 4.4 - Guards

While not explicitely required, I opted to use guards as a way to protect certain routes from unauthorised users. My implementation uses 3 guards, an authGuard for general "are you logged in?", a groupGuard for "are you a member of this channel?", and a channelGuard for "are you a member of this channel?". Unauthorised requests are redirected back to the login page in case anything has gone wrong. But in most cases, the only way to access these "forbidden" routes, would be by manually entering them in to the URL bar. The application currently does guard against accessing these routes through disabling button, or not showing them as being present at all for the case of channels.

### 4.5 - Routes

These are the routes I plan to implement. While this isn't concrete and could change in the final product, it should serve as a good reference point for how I want to design the application to look and feel - that being, quite modular.

| Route                   | Description                                                                                                                |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------|
| /                       | Should show a simple design on what the application is                                                                     |
| /login                  | A form to allow users to log in                                                                                            |
| /users                  | A page to view all the user's registered to the application.                                                               |
| /profile                | A page to view the currently logged in account's information with the ability to update it.                                |
| /profile/{username}     | A page to view another user's profile, including the groups they are a part of.                                            |
| /admin                  | Accessible only to Super Admins, gives the ability to administer users, including upgrades, etc.                           |
| /groups                 | A page to view all the groups available. There is also a button to create a new group                                      |
| /group/{id}             | A page to show information about a group including channels, users, admins, etc. Group admins can add/remove channels here |
| /group/{id}/{channelID} | One of the channels a user can interact with in a group. Group admins can add/remove members here                          |

---

## 5.0 - Node Server Architecture

The Node server of my implementation will account for server-side processing of data, and as an API for interactions between the front-end and the database. The API serves as a means to interact with the database, or files in this case, without directly accessing it.

### 5.1 - Modules

The most important module of this section is [Express](https://expressjs.com/), accounting for the API component of the application.

While I haven't set settled on it, my current plan is to use SwaggerUI as a way to expose the API, which is helpful for the [Server-Side Routes](#60---server-side-routes) section of this document. This also allows for a more clear way to see the API than it would be trawling through different files trying to find what each route accepts/does.

For authentication, JWT will be used. JWT is the standard for authentication and authorisation in APIs, allowing for a secure way to transmit this data over open channels.

In phase 2, sockets will need to be used for real-time data transmission, and MongoDB for data storage and connectivity.

### 5.2 - Functions

To utilise JWT authentication, there needs to be a function to handle decoding and encoding of the authentication data. This function will be implemented as middleware for each of the endpoints. JWT functionality is used to authorise users based on what permissions they have in a more secure way than simply requesting them as a parameter would be.

The connection to the MongoDB backend is handled by a piece of middleware that appends the connection to the database as a property of the request object. This allows for easy access to the database in each of the endpoints.

While this may not be 'secure' as the connection to the database remains alive for the enture duration of the request, it is a simple way to handle the connection to the database without having to re-establish it for each request, which can cause significant latency and doesn't scale.

### 5.3 - Files

As explained earlier, part 1 serves as a wrapper to the API. Since there is no functional database assigned yet, files have to be used to store data. In this case, there will be JSON files for the users, the groups, and the channels. In part 2, these files will be implemented as tables in MongoDB.

In terms of layout, the node server is laid out with files in place of the api url. the `/routes/api/group/group.ts` file directly correlates to the `/api/group` endpoints. Speperating out these files in to endpoints groups serves to break the code down in to more manageable pieces, and allows for a more modular approach to design. Improvements could be made such as by seperating out each individual endpoint in to its own file, but it's better than nothing.

For user uploaded files, a folder will be created to store them, referenced by a md5 hash of the uploader's username + filename. This will then be referenced in the database as a message with a file flag set to true.

### 5.4 - Global Variables

Global variables should rarely, if ever, be used as they create bad habits in writing code and architectural design. For the Express server, routes are assigned to a global `Router` object. This object is used to define all routes, before setting them as endpoints in the server.

---

## 6.0 - Server-Side Routes

| **Route**                          | **Method** | **Parameters**                   | **Returns**                                                          | **Description**                                                                                                                                                    |
|------------------------------------|------------|----------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  /api/user                         | GET        | NONE                             | A list of all Users, as User objects                                 | Retrieve all users that have been registered to the application                                                                                                    |
|  /api/user                         | POST       | body: User object                | A JWT for the new user                                               | Register a new user to the application with the provided user object passed in the body                                                                            |
|  /api/user/:username               | GET        | username                         | A User object                                                        | Retrieve data about the the user provided                                                                                                                          |
|  /api/user/:username               | PUT        | username, body: User object      | An updated JWT for the user                                          | Update data for a given user with the provided user object. Only updates fields provided, and keeps everything else the same                                       |
|  /api/user/:username               | DELETE     | username                         | A Success or error message                                           | Delete a user, given the username provided. Request must be authorised by either a super user, or the user trying to delete their own profile.                     |
|  /api/user/login                   | POST       | body: username, password         | A JWT for the logged in user                                         | Authenticate a user given their username and password with a JWT that does not expire.                                                                             |
|  /api/user/refresh                 | PATCH      | body: JWT                        | An updated JWT for the user                                          | Refresh a given JWT with all new data that has been registered (new groups, channels, roles, etc. are in the JWT)                                                  |
|  /api/group                        | GET        | NONE                             | A list of all Groups, as Group objects                               | Retrieve all groups that have been registered to the application                                                                                                   |
|  /api/group                        | POST       | body: name, description          | A group object for the new group, and an updated JWT for the creator | Register a new group to the application. The user making the post request is set as the user and group admin                                                       |
|  /api/group/:id                    | GET        | groupID                          | A group object                                                       | Retrieve data about the group provided                                                                                                                             |
|  /api/group/:id                    | PUT        | groupID, body: name, description | The updated group object                                             | Update data for a given group with the provided name and description. Only fields provided are adjusted, everything else remains the same.                         |
|  /api/group/:id                    | DELETE     | groupID                          | A Success or error message                                           | Delete a group, given the groupID provided. Request must be authorised by either a group admin or super user                                                       |
|  /api/group/:id/user/:username     | POST       | groupID, username                | The updated group object and updated JWT for the user being added    | Add a user as a member of the group.                                                                                                                               |
|  /api/group/:id/user/:username     | DELETE     | groupID, username                | A Success or error message                                           | Remove a user from a group                                                                                                                                         |
|  /api/channels/:group              | GET        | groupID (or 0 for all)           | A list of all Channels for a group, as Channel objects               | Retrieve all channels that have been registered for a particular group. Or if the group number provided is 0, retrieve all channels registered to the application. |
|  /api/channel/:channel             | GET        | channelID                        | A channel object                                                     | Retrieve data about a specific channel, given the channel ID                                                                                                       |
|  /api/channel/:group               | POST       | groupID, body: name, description | A channel object                                                     | Add a new channel to a particular group with the provided name and description                                                                                     |
|  /api/channel/:group               | PUT        | groupID, body: name, description | The updated channel object                                           | Update data for a given channel with the provided name and description. Only fields provided are adjusted, everything else remains the same.                       |
|  /api/channel/:group               | DELETE     | groupID                          | A Success or error message                                           | Remove a channel from the application (and group). Request must be authorised by either a group admin or super user.                                               |
|  /api/channel/:channelID/:username | POST       | channelID, username              | A Success or error message                                           | Add a user as a member of the channel                                                                                                                              |
|  /api/channel/:channelID/:username | DELETE     | channelID, username              | A Success or error message                                           | Remove a user as a member of the channel                                                                                                                           |
|  /api/channel/:channelID/:username | GET        | channelID, username              | True or False                                                        | Retrieve whether a given user is a member of the channel                                                                                                           |

---

## 7.0 - Testing

Testing is an important part of the development process. Tests were created on the backend side using Mocha and Chai (versions 10 and 4 respectively). These tests were created to test the API endpoints, and to ensure that the routes were functioning as intended, and could handle erroneous cases.

To run backend tests, first ensure you are in the server directory, and then run `npm test`. Please ensure that you have installed all dependancies prior by using `npm i`.

```bash
[...]3813ICT-assignment-2/server$ npm i
[...]3813ICT-assignment-2/server$ npm test
```
