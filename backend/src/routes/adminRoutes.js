import express from "express";
import {
  createUser,
  getUsers,
  resetPassword,
  deactivateUser,
  activateUser,
  getDashboardStats,
  getAuthGroups,
   getUserPermissions,
   updateUserPermission,
} from "../controllers/adminController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================
   USER MANAGEMENT (SUPER ADMIN ONLY 🔥)
========================= */

// 🔥 Create user
router.post(
  "/create-user",
  authenticateUser,
  requireSuperAdmin,
  createUser
);

// 🔥 Get all users
router.get(
  "/users",
  authenticateUser,
  requireSuperAdmin,
  getUsers
);

// 🔥 Reset password
router.post(
  "/reset-password/:id",
  authenticateUser,
  requireSuperAdmin,
  resetPassword
);

// 🔥 Deactivate
router.patch(
  "/deactivate/:id",
  authenticateUser,
  requireSuperAdmin,
  deactivateUser
);

// 🔥 Activate
router.patch(
  "/activate/:id",
  authenticateUser,
  requireSuperAdmin,
  activateUser
);

// 🔥 Get auth groups
router.get(
  "/auth-groups",
  authenticateUser,
  requireSuperAdmin,
  getAuthGroups
);

/* =========================
   DASHBOARD (can be relaxed later)
========================= */

router.get(
  "/dashboard-stats",
  authenticateUser,
  getDashboardStats
);
router.get(
  "/user-permissions/:id",
  authenticateUser,
  requireSuperAdmin,
  getUserPermissions
);

router.post(
  "/update-permission",
  authenticateUser,
  requireSuperAdmin,
  updateUserPermission
);

export default router;