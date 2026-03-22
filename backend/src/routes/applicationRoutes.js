import express from "express";
import { createApplication } from "../controllers/applicationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  authenticateUser,
  upload.array("files"),
  createApplication
);

export default router;