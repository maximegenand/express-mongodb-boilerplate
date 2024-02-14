# Express MongoDB Boilerplate

## Table of Contents

- [Inspirations](#inspirations)
- [Features](#features)
- [External Packages](#external-packages)
- [Commands](#commands)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Custom Mongoose Plugins](#custom-mongoose-plugins)

## Inspirations

_This is an **edited fork** of a project from [mewendorafi](https://github.com/mewendorafi/_node_express_server)'s, inspired himself by :_

- [Romain Lanz youtube video "différents moyens de gérer l'authentification"](https://www.youtube.com/watch?v=7ALYvSN8XZQ)
- [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate)
- [danielfsousa/express-rest-es2017-boilerplate](https://github.com/danielfsousa/express-rest-es2017-boilerplate)
- [madhums/node-express-mongoose](https://github.com/madhums/node-express-mongoose)
- [kunalkapadia/express-mongoose-es6-rest-api](https://github.com/kunalkapadia/express-mongoose-es6-rest-api)

## Features

- **Typescript**: rewrite the project integraly in Typescript
- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using MongoDB to store sessions
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi) (INCOMPLETE)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Error handling**: centralized error handling mechanism
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Sanitizing**: sanitize request data against query injection using [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize)
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)

## External Packages

### Dependencies

`bcrypt` This package is used for hashing and salting passwords, often used in authentication systems.

`compression` Compression middleware for Express to compress HTTP responses, reducing data transfer size.

`cors` Middleware for enabling Cross-Origin Resource Sharing (CORS) in your Express application, allowing it to make requests to different domains.

`debug` A tiny debugging utility for Node, often used for logging and debugging purposes.

`dotenv` A module for loading environment variables from a .env file into process.env for configuration.

`express` A web framework for Node that simplifies building web applications.

`express-mongo-sanitize` Middleware for sanitizing and filtering user-supplied data to prevent MongoDB operator injection attacks.

`express-rate-limit` Middleware for rate limiting requests to protect your server from abuse or spam.

`helmet` Security middleware for Express that sets various HTTP headers to enhance security.

`http-status` A module that provides a list of HTTP status codes as constants.

`joi` A library for data validation, used for validating and sanitizing user inputs.

`mongoose` A MongoDB object modeling tool for Node, used for interacting with MongoDB databases.

`morgan` Middleware for logging HTTP requests in Express.

`validator` A library for data validation, often used for input validation and sanitization.

`winston` A versatile logging library for Node applications, providing multiple logging transports.

### DevDependencies

`nodemon` A utility that monitors for changes in your Node application and automatically restarts the server during development.

`cross-env` A utility for setting environment variables consistently across different platforms (Windows, macOS, Linux). It's particularly useful when setting environment variables within npm scripts because the shell syntax can vary between operating systems.

`Typescript` A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

### Scripts

`dev` Runs the development server using nodemon with the NODE_ENV variable set to development.

`start` Starts the production server with the NODE_ENV variable set to production.

## Commands

Running locally:

```bash
yarn dev
```

Building the project in dist/server.js :

```bash
yarn build
```

Running in production:

```bash
yarn start
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Execution environment (production, development, test)
NODE_ENV=development

# Server port number
PORT=3000

# Mongo database
MONGODB_URL=mongodb+srv://databaseUser:password@cluster0.example.mongodb.net/
DB_NAME=express-mongodb-boilerplate

# Tokens
TOKEN_ACCESS_EXPIRATION_MINUTES=60
TOKEN_REFRESH_EXPIRATION_DAYS=30

```

## Project Structure

```
src\
 |—config\         # Environment variables and configuration related things
 |—controllers\    # Route controllers (controller layer)
 |—database\       # Mongoose models (data layer)
 |—middlewares\    # Custom express middlewares
 |—routes\         # Routes
 |—services\       # Business logic (service layer)
 |—utils\          # Utility classes and functions
 |—app.js          # Express app
 |—server.js       # Server entry point (startup file)
```

## API Endpoints

List of available routes:

**Auth routes**:\
`POST /auth/register` - register\
`POST /auth/login` - login\
`POST /auth/logout` - logout\
`POST /auth/refresh-tokens` - refresh auth tokens\
`~~POST /auth/forgot-password~~` - send reset password email\
`~~POST /auth/reset-password~~` - reset password\
`~~POST /auth/send-verification-email~~` - send verification email\
`~~POST /auth/verify-email~~` - verify email

**User routes**:\
`POST /users` - create a user\
`GET /users` - get all users\
`GET /users/:userId` - get user\
`PATCH /users/:userId` - update user\
`DELETE /users/:userId` - delete user

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```typescript
import { catchAsync } from "@utils";
import type { Request, Response } from "express";

const controller = catchAsync(async (req: Request, res: Response) => {
  // This error will be forwarded to the error handling middleware
  throw new Error("Something wrong happened");
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```typescript
import httpStatus from "http-status";
import { ApiError } from "@utils";
import { User } from "@database/models";
import type { Request, Response } from "express";

const getUser = async (uid: string) => {
  const userFound = await User.findOne({ uid });
  if (!userFound) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
};
```

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```typescript
import express from "express";
import { authMiddleware } from "@middlewares";
import { userController } from "@controllers";

const router = express.Router();

router.post("/users", authMiddleware(), userController.createUser);
```

These routes require a valid access token. It can be received from the **Authorization request header** using the Bearer schema or from an **accessToken cookie**.

If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /auth/register`) or login (`POST /auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

An access token is valid for 60 minutes. You can modify this expiration time by changing the `TOKEN_ACCESS_EXPIRATION_MINUTES` environment variable in the .env file.

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /auth/refresh-tokens`) and sending along a valid refresh token in the request body.\
This call returns a new access token and a new refresh token.

A refresh token is valid for 30 days. You can modify this expiration time by changing the `TOKEN_REFRESH_EXPIRATION_DAYS` environment variable in the .env file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```typescript
import express from "express";
import { authMiddleware } from "@middlewares";
import { userController } from "@controllers";

const router = express.Router();

router.post("/users", authMiddleware("manageUsers"), userController.createUser);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `src/config/roles.config.ts` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `src/config/logger.config.ts`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```typescript
import { logger } from "@config";

logger.error("message"); // level 0
logger.warn("message"); // level 1
logger.info("message"); // level 2
logger.http("message"); // level 3
logger.verbose("message"); // level 4
logger.debug("message"); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app can use pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Custom Mongoose Plugins

The app also contains two custom mongoose plugins that you can attach to any mongoose model schema. You can find the plugins in `src/database/plugins`.

```typescript
import { Schema, model } from "mongoose";
import { toJSON, paginate } from "@database/plugins";

const userSchema = new Schema(
  {
    /* schema definition here */
  },
  { timestamps: true }
);

userSchema.plugin(toJSON, { private: ["field1", "field2"] });
userSchema.plugin(paginate);

const User = model("users", userSchema);
```

#### toJSON

The toJSON plugin applies the following changes in the toJSON transform call:

- removes \_\_v, createdAt, updatedAt, and any schema path that has be specified in options
- replaces \_id with id

#### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```javascript
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```javascript
const options = {
  sortBy: "name:desc", // sort order
  populate: "value1,value2", // populate fields
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```
