import {
  logoutController,
  refreshTokenController,
  signUpController,
  loginController,
  forgotPasswordController,
  verifyOTPController,
  resetPasswordController,
} from "../controllers/auth";

const router = require("express").Router();

router.post("/signup", signUpController);

router.post("/login", loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/forgot-password", forgotPasswordController);

router.post("/verify-otp", verifyOTPController);

router.post("/reset-password", resetPasswordController);

router.post("/logout", logoutController);

export default router;
