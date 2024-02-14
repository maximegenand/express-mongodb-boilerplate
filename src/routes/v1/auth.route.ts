import express from "express";

import { authController } from "@controllers";

const router = express.Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.post("/refresh-tokens", authController.refreshTokens);

// router.post('/forgot-password', auth.forgotPassword);
// router.post('/reset-password', auth.resetPassword);
// router.post('/send-verification-email', auth.sendVerificationEmail);
// router.post('/verify-email', auth.verifyEmail);

export default router;
