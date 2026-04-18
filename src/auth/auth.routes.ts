import express from "express";
import {
  forgetPassword,
  getProfile,
  login,
  logout,
  oAuthCallback,
  refreshAccessToken,
  resetPassword,
  signup,
  verifyCodeForPassword,
  verifyEmail,
} from "../auth/auth.controller";
import {
  codeValidator,
  emailValidator,
  loginValidator,
  otpValidator,
  passwordValidator,
  registrationValidation,
} from "./auth.validator";
import { validateInputs } from "../middlewares/validateInputs";
import {
  loginLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../middlewares/rateLimiter";
import { verifyToken } from "../middlewares/verifyToken";
import { oAuthenticated, oCallback } from "../middlewares/passportOAuth";

const router = express.Router();

router.get("/google", oAuthenticated);
router.get("/google/callback", oCallback, oAuthCallback);

router.get("/get-profile", verifyToken, getProfile);

router.post("/login", loginValidator, validateInputs, login);
router.post(
  "/signup",
  signupLimiter,
  registrationValidation,
  validateInputs,
  signup,
);
router.post(
  "/verify-email",
  verifyEmailLimiter,
  otpValidator,
  validateInputs,
  verifyEmail,
);

router.patch(
  "/forget-password",
  emailValidator,
  validateInputs,
  forgetPassword,
);
router.post(
  "/verify-code/:id",
  codeValidator,
  validateInputs,
  verifyCodeForPassword,
);
router.patch(
  "/new-password/:id",
  passwordValidator,
  validateInputs,
  resetPassword,
);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export const authRoutes = router;
