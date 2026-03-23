import express from "express";
import {
  getAdminsWithPermissions,
  updatePermissions
} from "../controllers/adminPermissionController.js";

const router = express.Router();

router.get("/admins-with-permissions", getAdminsWithPermissions);
router.post("/update-permissions", updatePermissions);

export default router;