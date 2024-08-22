# Chat me Up

[![wakatime](https://wakatime.com/badge/user/1d38e8c4-1b41-48a3-be33-c2f87af55349/project/13079cef-233a-4898-b1d6-1589f9840505.svg?style=flat)](https://wakatime.com/badge/user/1d38e8c4-1b41-48a3-be33-c2f87af55349/project/13079cef-233a-4898-b1d6-1589f9840505)

Chat me up is my implementation of the 3813ICT Assignment.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Prelude](#prelude)
  - [Phase 1](#phase-1)
  - [Phase 2](#phase-2)
- [About this Git Repository](#about-this-git-repository)
  - [Installation/Usage](#installationusage)
- [Data Structures](#data-structures)
  - [Users](#users)
- [Angular Architecture](#angular-architecture)
  - [Components](#components)
  - [Services](#services)
  - [Models](#models)
  - [Routes](#routes)
- [Node Server Architecture](#node-server-architecture)
  - [Modules](#modules)
  - [Functions](#functions)
  - [Files](#files)
  - [Global Variables](#global-variables)
- [Server-Side Routes](#server-side-routes)

<!-- /code_chunk_output -->

## Prelude

The overall plan for this assignment is to create a chatting up, not dissimilar to Discord or Skype. While it may seem like a large task overall, the assignment has been seperated in to two phases.

### Phase 1

Phase 1 consists of documenting design choices and frameworking the basics of the application, without delving too heavily in to the meat of the application. In this phase, documentation will be key, as well as some idea of how data is to be stored in Phase 2. This phase also looks at constructing the underlying API, and a bespoke user interface to match.

### Phase 2

Phase 2 consists of making the app more than just a wrapper for an API. In this section, a MongoDB database will be implemented based off the data-design choices made in [Phase 1](#phase-1). Additionally, some more interesting features, including sockets for real time text-chat, PeerJS for video chat, images for users, etc, are to be implemented.

---

## About this Git Repository

This git repo has been set up as a stock-standard Angular Project. For development, I made the conscious decision to lock the [Main Branch](https://github.com/NickBland/3813ICT-assignment-1/tree/main) down, and to use a [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). By working in this manner, the main branch should always be in a 'working' state, with breaking changes and brand new features warranting their own branch for testing and development before being merged.

### Installation/Usage

1. Clone the repo with `git clone https://github.com/NickBland/3813ICT-assignment-1.git assignment-1`.
2. Enter the repo with `cd assignment-1`.
3. Initialise the node modules for both the server and frontend with `npm i && cd server && npm i && cd ..`.
4. Serve the application with `npm start`, and you should be able to access it at [http://localhost:4200](http://localhost:4200).

---

## Data Structures

Being a chat application, there is a lot of data that needs to be stored. The requirements for the application have laid out what each piece of data should look like, and below is how I plan to use this data.

### Users

---

## Angular Architecture

### Components

### Services

### Models

### Routes

---

## Node Server Architecture

### Modules

### Functions

### Files

### Global Variables

---

## Server-Side Routes
