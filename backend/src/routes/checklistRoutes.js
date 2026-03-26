import express from "express";
import {
  generateChecklistsForApplication,
  saveChecklistResponses,
  submitChecklistForReview,
  finalizeChecklistReview,
  getChecklistsByApplication,
  getChecklistById,
  getChecklistWorkspace,
  calculateChecklistPreview,

} from "../controllers/checklistController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/application/:applicationId",
  authenticateUser,
  getChecklistsByApplication
);

router.get(
  "/:checklistId",
  authenticateUser,
  getChecklistById
);

router.post(
  "/application/:applicationId/generate",
  authenticateUser,
  generateChecklistsForApplication
);

router.put(
  "/:checklistId/responses",
  authenticateUser,
  saveChecklistResponses
);

router.get(
  "/:checklistId/workspace",
  authenticateUser,
  getChecklistWorkspace
);
router.post(
  "/:checklistId/submit",
  authenticateUser,
  submitChecklistForReview
);

router.post(
  "/:checklistId/calculate-preview",
  authenticateUser,
  calculateChecklistPreview
);

router.put(
  "/:checklistId/review",
  authenticateUser,
  finalizeChecklistReview
);

export default router;