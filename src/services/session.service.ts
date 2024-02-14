import httpStatus from "http-status";

import { ApiError } from "@utils";
import { Session } from "@database/models";

import type { Types } from "mongoose";

async function generateSession(userId: Types.ObjectId) {
  const session = await Session.create({ user: userId });
  return session;
}

async function checkAccess(accessToken: string) {
  const session = await Session.findOne({
    accessToken,
    accessTokenExpires: { $gt: new Date() },
  });
  if (!session)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  return session;
}

const refreshSession = async (refreshToken: string) => {
  const oldSession = await Session.findOne({ refreshToken });
  if (!oldSession)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  await oldSession.deleteOne();
  const session = await generateSession(oldSession.user);
  return session;
};

const deleteUser = async (id: Types.ObjectId) => {
  const sessions = await Session.deleteMany({ user: id });
  return sessions;
};

const logout = async (accessToken: string) => {
  const session = await Session.findOne({ accessToken });
  if (!session) throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  await session.deleteOne();
};

export const sessionService = {
  logout,
  checkAccess,
  generateSession,
  refreshSession,
  deleteUser,
};
