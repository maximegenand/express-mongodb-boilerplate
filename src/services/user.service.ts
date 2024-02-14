import httpStatus from "http-status";

import { ApiError } from "@utils";
import { User } from "@database/models";

import type { IUser } from "@database/models";

async function create(body: IUser) {
  if (await User.isEmailTaken(body.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(body);
}

async function queryAll(
  filter: Record<string, any>,
  options: Record<string, any>
) {
  const users = await User.paginate(filter, options);
  return users;
}

function queryByUid(uid: string) {
  return User.findOne({ uid });
}

function queryByEmail(email: string) {
  return User.findOne({ email });
}

async function updateByUid(uid: string, body: Partial<IUser>) {
  const user = await queryByUid(uid);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (body.email && (await User.isEmailTaken(body.email, user.id)))
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");

  Object.assign(user, body);
  await user.save();
  return user;
}

async function deleteByUid(uid: string) {
  const user = await queryByUid(uid);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.deleteOne();
  return user;
}

export const userService = {
  create,
  queryAll,
  queryByUid,
  queryByEmail,
  updateByUid,
  deleteByUid,
};
