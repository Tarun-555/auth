import {
  logoutController,
  refreshTokenController,
  signUpController,
  loginController,
} from "../controllers/login";

const router = require("express").Router();

router.post("/signup", signUpController);

router.post("/login", loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);

export default router;
