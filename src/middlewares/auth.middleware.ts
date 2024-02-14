import httpStatus from "http-status";

import { ApiError } from "@utils";
import { ROLE_RIGHTS } from "@config";
import { sessionService } from "@services";

import type { Request, Response, NextFunction } from "express";
import type { Role, Rights } from "@config";
import type { IUser } from "@database/models";

const verifyCallback = (role: Role, requiredRights: Rights[]) => {
  if (requiredRights.length) {
    const userRights = ROLE_RIGHTS[role];
    if (!userRights.length)
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");

    const hasRequiredRights = requiredRights.every((requiredRight) =>
      userRights.includes(requiredRight)
    );
    if (!hasRequiredRights)
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  }
};

//! Must be defined as arrow function, otherwise Express Router will crash (see more below)
export const authMiddleware =
  (...requiredRights: Rights[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      if (!accessToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
      }

      const auth = await sessionService.checkAccess(accessToken);
      if (!auth) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
      }

      // check if user has required rights
      const { user } = await auth.populate<{ user: IUser }>("user");
      verifyCallback(user.role, requiredRights);

      res.locals.user = auth.user;
      res.locals.userId = auth.user._id.toString();
      res.locals.accessToken = accessToken;
      next();
    } catch (error) {
      next(error);
    }
  };

/*
When referencing or calling a middleware function inside a controller/route,
the context must be kept global as the middleware relies on the value of the global "this" object.
So, using an arrow function ensures that the function maintains the surrounding lexical scope,
and does not create a new "this" context.
*/
