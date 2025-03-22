import {
  logoutController,
  refreshTokenController,
  signUpController,
} from "../controllers/login";

const router = require("express").Router();

const { loginController } = require("../controllers/login");

router.post("/signup", signUpController);

router.post("/login", loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);

export default router;
