import express from "express";

import {
  getAdminsWithPermissions,
  updatePermissions
} from "../controllers/adminPermissionController.js";

import { inviteAssessor } from "../controllers/adminPermissionController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { loadPermissions } from "../middleware/hasPermission.js";

const router = express.Router();

// 🔹 Permissions Management
router.get("/admins-with-permissions",authenticateUser, getAdminsWithPermissions);
router.post("/update-permissions",authenticateUser, updatePermissions);

// 🔹 Invite Assessor
router.post(
  "/invite-assessor",
  authenticateUser,
  loadPermissions,   // ✅ FIRST load permissions
  inviteAssessor     // ✅ controller decides permission
);

export default router;