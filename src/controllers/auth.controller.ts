import httpStatus from "http-status";

import { ApiError, catchAsync } from "@utils";
import { userService, sessionService } from "@services";

const register = catchAsync(async (req, res) => {
  const newUser = await userService.create(req.body);
  const tokens = await sessionService.generateSession(newUser._id);
  res.status(httpStatus.CREATED).send({ newUser, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.queryByEmail(email);
  if (!user || !(await user.isPasswordMatch(password)))
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  const tokens = await sessionService.generateSession(user._id);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await sessionService.logout(req.body.accessToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await sessionService.refreshSession(req.body.refreshToken);
  res.send({ tokens });
});

// const forgotPassword = catchAsync(async (req, res) => {
//   const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
//   await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
//   res.status(http.NO_CONTENT).send();
// });

// const resetPassword = catchAsync(async (req, res) => {
//   await authService.resetPassword(req.query.token, req.body.password);
//   res.status(http.NO_CONTENT).send();
// });

// const sendVerificationEmail = catchAsync(async (req, res) => {
//   const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
//   await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
//   res.status(http.NO_CONTENT).send();
// });

// const verifyEmail = catchAsync(async (req, res) => {
//   await authService.verifyEmail(req.query.token);
//   res.status(http.NO_CONTENT).send();
// });

export const authController = {
  register,
  login,
  logout,
  refreshTokens,
  // forgotPassword,
  // resetPassword,
  // sendVerificationEmail,
  // verifyEmail,
};
