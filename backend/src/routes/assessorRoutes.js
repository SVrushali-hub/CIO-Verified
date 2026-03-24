import express from "express";
import {
  validateToken,
  submitProfile
} from "../controllers/assessorController.js";

import {upload} from "../middleware/upload.js";

const router = express.Router();

// validate link
router.get("/validate-token", validateToken);

// submit form
router.post(
  "/submit-profile",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "company_profile", maxCount: 1 }
  ]),
  submitProfile
);

export default router;