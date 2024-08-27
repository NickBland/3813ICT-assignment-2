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
  - [4.4 - Routes](#44---routes)
- [5.0 - Node Server Architecture](#50---node-server-architecture)
  - [5.1 - Modules](#51---modules)
  - [5.2 - Functions](#52---functions)
  - [5.3 - Files](#53---files)
  - [5.4 - Global Variables](#54---global-variables)
- [6.0 - Server-Side Routes](#60---server-side-routes)

<!-- /code_chunk_output -->

## 1.0 - Prelude

The overall plan for this assignment is to create a chatting up, not dissimilar to Discord or Skype. While it may seem like a large task overall, the assignment has been seperated in to two phases.

### 1.1 - Phase 1

Phase 1 consists of documenting design choices and frameworking the basics of the application, without delving too heavily in to the meat of the application. In this phase, documentation will be key, as well as some idea of how data is to be stored in Phase 2. This phase also looks at constructing the underlying API, and a bespoke user interface to match.

### 1.2 - Phase 2

Phase 2 consists of making the app more than just a wrapper for an API. In this section, a MongoDB database will be implemented based off the data-design choices made in [Phase 1](#11---phase-1). Additionally, some more interesting features, including sockets for real time text-chat, PeerJS for video chat, images for users, etc, are to be implemented.

---

## 2.0 - About this Git Repository

This git repo has been set up as a stock-standard Angular Project. For development, I made the conscious decision to lock the [Main Branch](https://github.com/NickBland/3813ICT-assignment-1/tree/main) down, and to use a [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). By working in this manner, the main branch should always be in a 'working' state, with breaking changes and brand new features warranting their own branch for testing and development before being merged.

### 2.1 - Installation/Usage

1. Clone the repo with `git clone https://github.com/NickBland/3813ICT-assignment-1.git assignment-1`.
2. Enter the repo with `cd assignment-1`.
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

Components should be made for most of the objects that will be displayed on screen. This includes components for forms, profiles, each channel, each group.

### 4.2 - Services

Where data is being fetched or saved from the API, a service will need to be used. While components are used to render the data, keeping fetching and saving away from the rendering process allows for more re-usability within the codebase.

### 4.3 - Models

The objects I mentioned earlier in [Section 3.1](#31---in-general) should be stored as Models within Angular. These can easily be imported when needed through the project and serve as a centralised way to house the data structure. This also allows for ample documentation to be added during the creation of them, making for easier development.

### 4.4 - Routes

These are the routes I plan to implement. While this isn't concrete and could change in the final product, it should serve as a good reference point for how I want to design the application to look and feel - that being, quite modular.

| Route                   | Description                                                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|
| /                       | Should show a simple design on what the application is                                                             |
| /profile                | A page to view the currently logged in account's information with the ability to update it.                        |
| /login                  | A form to allow users to log in                                                                                    |
| /user/{username}        | A page to view another user's profile, including the groups they are a part of.                                    |
| /admin                  | Accessible only to Super Admins, gives the ability to administer users, including upgrades, etc.                   |
| /groups                 | A page to view all the groups available                                                                            |
| /groups/create          | A page to create a new group, which will then be displayed on the /groups route                                    |
| /group/{id}             | A page to show information about a group including channels, users, admins, etc. with ability to register interest |
| /group/{id}/{channelID} | One of the channels a user can interact with in a group                                                            |
| /group/{id}/admin       | Accessible only by a Super Admin or Group admin allowing administration of the group                               |

---

## 5.0 - Node Server Architecture

The Node server of my implementation will account for server-side processing of data, and as an API for interactions between the front-end and the database.

### 5.1 - Modules

The most important module of this section is [Express](https://expressjs.com/), accounting for the API component of the application.

While I haven't set settled on it, my current plan is to use SwaggerUI as a way to expose the API, which is helpful for the [Server-Side Routes](#60---server-side-routes) section of this document. This also allows for a more clear way to see the API than it would be trawling through different files trying to find what each route accepts/does.

### 5.2 - Functions

### 5.3 - Files

### 5.4 - Global Variables

---

## 6.0 - Server-Side Routes

TBD
