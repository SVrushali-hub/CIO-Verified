import express from "express";

import {
  getProfile,
  updateProfile,sendResetOtp,
  verifyOtpAndReset,
  sendEmailOtp,
  verifyEmailOtp
} from "../controllers/profileController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { updateCompanyProfile } from "../controllers/profileController.js";


const router = express.Router();

router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser , updateProfile);
router.put("/company", authenticateUser, updateCompanyProfile);

router.post("/send-otp", authenticateUser, sendResetOtp);
router.post("/send-email-otp", authenticateUser, sendEmailOtp);
router.post("/verify-email-otp", authenticateUser, verifyEmailOtp); 
router.post("/verify-otp", authenticateUser, verifyOtpAndReset);

export default router;