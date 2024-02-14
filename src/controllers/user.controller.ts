import httpStatus from "http-status";

import { ApiError, catchAsync, pickObjProps } from "@utils";
import { userService, sessionService } from "@services";

import type { Request, Response } from "express";

const get = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.queryByUid(req.params.uid);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return res.status(httpStatus.OK).send({ user });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const newUser = await userService.create(req.body);
  return res.status(httpStatus.CREATED).send({ newUser });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateByUid(req.params.uid, req.body);
  return res.status(httpStatus.OK).send({ user });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.deleteByUid(req.params.uid);
  await sessionService.deleteUser(user._id);
  return res.status(httpStatus.NO_CONTENT).send();
});

const queryAll = catchAsync(async (req: Request, res: Response) => {
  const filter = pickObjProps(req.query, ["name", "role"]);
  const options = pickObjProps(req.query, ["sortBy", "limit", "page"]);
  const users = await userService.queryAll(filter, options);
  return res.status(httpStatus.OK).send(users);
});

export const userController = {
  get,
  create,
  update,
  remove,
  queryAll,
};
