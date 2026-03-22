import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyOTP } from "../controllers/authController.js";
const router = express.Router();
console.log("🔥 AUTH ROUTES LOADED");
router.post("/register", register);
router.post("/login", login);

router.post("/verify-otp", verifyOTP);
export default router;