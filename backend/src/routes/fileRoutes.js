import express from "express";
import multer from "multer";
import { uploadEvidence } from "../controllers/fileController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/upload", authenticateUser, upload.single("file"), uploadEvidence);

export default router;