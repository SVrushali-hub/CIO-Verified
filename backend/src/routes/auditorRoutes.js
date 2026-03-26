import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  getAssignedApplications,
  getAuditorApplicationDetails,
  startAuditForApplication,
} from "../controllers/auditorController.js";

const router = express.Router();

router.get("/applications", authenticateUser, getAssignedApplications);

router.get(
  "/application/:applicationId/details",
  authenticateUser,
  getAuditorApplicationDetails
);

router.get(
  "/application/:applicationId/start-audit",
  authenticateUser,
  startAuditForApplication
);

export default router;