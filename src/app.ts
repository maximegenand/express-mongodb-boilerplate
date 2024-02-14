import express from "express";

import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongo_sanitize from "express-mongo-sanitize";
import helmet from "helmet";
import httpStatus from "http-status";
import logger from "morgan";

import { config } from "@config";
import { ApiError } from "@utils";
import { authLimiter, error } from "@middlewares";

import indexRouter from "@routes/v1";

const app = express();

// Set security HTTP headers => https://www.npmjs.com/package/helmet
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Handle URL-encoded form data parsing of POST request body
// "extended" option allows for rich objects and arrays to be encoded into the URL-encoded format
// [true] use qs ("query string") library to handle parsing of rich (deeply nested) objects and arrays
// [false] use NodeJS built-in querystring library to parse in a flat object format (values are either strings or arrays of strings)
app.use(express.urlencoded({ extended: false }));

// Sanitize request data against query injection
app.use(mongo_sanitize());

// Gzip payload compression
app.use(compression());

// Enable CORS (Cross Origin Resource Sharing)
app.use(cors());
app.options("*", cors());

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names => https://www.npmjs.com/package/cookie-parser
app.use(cookieParser());

// Log routes outputs to console in development mode => https://www.npmjs.com/package/morgan
app.use(logger("dev"));

// Limit repeated failed requests to auth endpoints
if (config.ENV === "production") {
  app.use("/auth", authLimiter);
}

//! Call the router before calling the error middlewares, otherwise API requests won't work
// API routes
app.use("/", indexRouter);

// Catch 404 and forward to error handler for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Convert error to custom class ApiError if needed
app.use(error.converter);

// Error handler
app.use(error.handler);

export default app;
