import httpStatus from "http-status";
import { Error as MongooseError } from "mongoose";

import { ApiError } from "@utils";
import { config, logger } from "@config";

import type { Request, Response, NextFunction } from "express";

const errorConverter = (
  err: Error | MongooseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError =
    err instanceof ApiError
      ? err
      : new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);

  if (!(err instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof MongooseError
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;
  if (config.ENV === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.ENV === "development" && { stack: err.stack }),
  };

  if (config.ENV === "development") logger.error(err);

  res.status(statusCode).send(response);
};

export const error = {
  converter: errorConverter,
  handler: errorHandler,
};
