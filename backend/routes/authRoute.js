import express from "express";
import { login, sendResetOtp, resetPassword } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;