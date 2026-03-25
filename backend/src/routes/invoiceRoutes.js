import express from "express";
import {
  generateInvoice,
  getInvoiceByApplication,
  downloadInvoice,
  acceptInvoice,
  raiseInvoiceIssue,
    markAsPaid,
    getInvoiceIssues,
    resolveInvoiceIssue,
    getIssueMessages,
    replyToIssue,
    rejectInvoiceIssue,
    generateReceipt,
    sendReceiptEmail
} from "../controllers/invoiceController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { loadPermissions, hasPermission } from "../middleware/hasPermission.js";

const router = express.Router();

/* =========================
   GENERATE INVOICE (ADMIN)
========================= */
router.post(
  "/generate",
  authenticateUser,
  loadPermissions,
  hasPermission("generate_invoice"),
  generateInvoice
);

/* =========================
   GET INVOICE
========================= */
router.get(
  "/:application_id",
  authenticateUser,
  loadPermissions,
  hasPermission("view_applications"),
  getInvoiceByApplication
);

/* =========================
   DOWNLOAD PDF
========================= */
router.get(
  "/download/:application_id",
  authenticateUser,
  downloadInvoice
);

/* =========================
   ACCEPT INVOICE
========================= */
router.post(
  "/accept/:id",
  authenticateUser,
  acceptInvoice
);

/* =========================
   RAISE ISSUE
========================= */
router.post(
  "/issue/:id",
  authenticateUser,
  raiseInvoiceIssue
);
router.post(
  "/mark-paid/:id",
  authenticateUser,
  loadPermissions,
  hasPermission("mark_payment"),
  markAsPaid
);

router.post(
  "/issue/:id",
  authenticateUser,
  raiseInvoiceIssue
);

router.get(
  "/issues",
  authenticateUser,
  loadPermissions,
  hasPermission("view_applications"),
  getInvoiceIssues
);



/* 🔥 CHAT */

router.get(
  "/issues/:id",
  authenticateUser,
  loadPermissions,
  (req, res, next) => {if (req.user.role === "APPLICANT") return next(); 
    return hasPermission("view_issues")(req, res, next);},
  getIssueMessages
);

router.post(
  "/reply/:id",
  authenticateUser,
    loadPermissions,
    (req, res, next) => {if (req.user.role === "APPLICANT") return next(); 
    return hasPermission("reply_issues")(req, res, next);},
  replyToIssue
);
router.post(
  "/resolve/:id",
  authenticateUser,
  loadPermissions,
  (req, res, next) => {if (req.user.role === "APPLICANT") return next(); 
    return hasPermission("resolve_issues")(req, res, next);},
  resolveInvoiceIssue
);

router.post(
  "/reject/:id",
  authenticateUser,
  loadPermissions,
  (req, res, next) => {if (req.user.role === "APPLICANT") return next(); 
    return hasPermission("resolve_issues")(req, res, next);},
  rejectInvoiceIssue
);
router.get(
  "/receipt/:id",
  authenticateUser,
  loadPermissions,
  hasPermission("verify_payment"),
  generateReceipt
);

router.post(
  "/send-receipt/:id",
  authenticateUser,
  loadPermissions,
  hasPermission("verify_payment"),
  sendReceiptEmail
);
export default router;