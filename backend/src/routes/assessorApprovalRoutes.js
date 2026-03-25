import express from "express";
import {
getSubmittedAssessors,
adminDecision
} from "../controllers/assessorApprovalController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { hasPermission } from "../middleware/hasPermission.js";

const router = express.Router();

// 🔥 View submissions
router.get(
"/assessors/submitted",
authenticateUser,
hasPermission("review_assessor_application"),
getSubmittedAssessors
);

// 🔥 Approve / Reject
router.post(
"/assessors/admin-decision",
authenticateUser,
hasPermission("approve_assessor_admin"),
adminDecision
);

export default router;