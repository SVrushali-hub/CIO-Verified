import express from "express";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getApplications,        // 🔥 NEW
  setPricing,
  cancelApplication       // 🔥 NEW
} from "../controllers/applicationController.js";

import { upload } from "../middleware/upload.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { hasPermission, loadPermissions } from "../middleware/hasPermission.js";

const router = express.Router();

/* =========================
   GET ROUTES
========================= */
router.get(
  "/",
  authenticateUser,
  loadPermissions,   // ✅ FIRST load permissions
  hasPermission("view_applications"),
  getApplications
);

// Applicant
router.get("/my", authenticateUser, getMyApplications);

// Single application
router.get("/:id", authenticateUser, getApplicationById);

// 🔥 SUPERADMIN + ADMIN (with permission)

/* =========================
   POST ROUTES
========================= */

// Submit application
router.post(
  "/submit",
  authenticateUser,
  upload.fields([
    { name: "gstDoc" },
    { name: "sezDoc" },
    { name: "companyProfile" },
    { name: "pitchDeck" },
    { name: "certifications" },
  ]),
  submitApplication
);

// 🔥 SET PRICING (SUPERADMIN / ADMIN WITH PERMISSION)
router.post(
  "/set-pricing",
  authenticateUser,
  hasPermission("set_pricing"),
  setPricing
);

router.post(
  "/cancel/:id",
  authenticateUser,
  cancelApplication
);
export default router;