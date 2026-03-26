import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { getReviewerApplications } from "../controllers/reviewerController.js";
import { getReviewerAssignedChecklists } from "../controllers/reviewerController.js";

const router = express.Router();

router.get("/applications", authenticateUser, getReviewerApplications);
router.get("/checklists", authenticateUser, getReviewerAssignedChecklists);

export default router;