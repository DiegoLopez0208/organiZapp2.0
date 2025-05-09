import { Router } from "express";
import { authController } from "../controllers/authController.js";

export const authRoutes = () => {
  const authRouter = Router();
  const { login, register, refresh, oauthLogin } = authController();
  authRouter.route("/auth/login").post(login);

  authRouter.route("/auth/register").post(register);

  authRouter.route("/auth/refresh").post(refresh);

  authRouter.route("/auth/oauth-login").post(oauthLogin);

  return authRouter;
};
