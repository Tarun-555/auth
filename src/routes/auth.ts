import {
  logoutController,
  refreshTokenController,
  signUpController,
  loginController,
  forgotPasswordController,
} from "../controllers/auth";

const router = require("express").Router();

router.post("/signup", signUpController);

router.post("/login", loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/forgot-password", forgotPasswordController);

router.post("/logout", logoutController);

export default router;
