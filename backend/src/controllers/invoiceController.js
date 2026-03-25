import db from "../config/db.js";
import PDFDocument from "pdfkit";
import { sendEmail } from "../utils/mailer.js";
/* =========================
   GENERATE INVOICE
========================= */
export const generateInvoice = async (req, res) => {
  try {
    const { application_id } = req.body;
    const adminId = req.user.id;

    const [apps] = await db.query(
      "SELECT total_amount, status FROM applications WHERE id = ?",
      [application_id]
    );

    if (!apps.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = apps[0];

    if (app.status !== "PRICING_DEFINED") {
      return res.status(400).json({
        message: "Pricing not defined yet",
      });
    }

    const [result] = await db.query(
      `INSERT INTO invoices (application_id, total_amount, status, created_by)
       VALUES (?, ?, 'SENT', ?)`,
      [application_id, app.total_amount, adminId]
    );

    await db.query(
      `UPDATE applications 
       SET status = 'INVOICE_SENT' 
       WHERE id = ?`,
      [application_id]
    );

    res.json({
      message: "Invoice generated successfully",
      invoice_id: result.insertId,
    });

  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};


/* =========================
   GET INVOICE
========================= */
export const getInvoiceByApplication = async (req, res) => {
  try {
    const { application_id } = req.params;

    const [rows] = await db.query(`
      SELECT i.*, a.legal_name, a.contact_email
      FROM invoices i
      JOIN applications a ON i.application_id = a.id
      WHERE i.application_id = ?
      ORDER BY i.id DESC
      LIMIT 1
    `, [application_id]);

    if (!rows.length) {
      return res.status(404).json({ message: "No invoice found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching invoice" });
  }
};


/* =========================
   DOWNLOAD INVOICE
========================= */
export const downloadInvoice = async (req, res) => {
  try {
    const { application_id } = req.params;

    const [rows] = await db.query(
      `SELECT a.*, i.total_amount
       FROM applications a
       JOIN invoices i ON i.id = (
         SELECT MAX(id)
         FROM invoices
         WHERE application_id = a.id
       )
       WHERE a.id = ?`,
      [application_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const app = rows[0];

    if (!app.total_amount) {
      return res.status(400).json({
        message: "Invoice not generated yet",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${application_id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("CIO Verified", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("INVOICE", { align: "center" });
    doc.moveDown(2);

    doc.text(`Application ID: ${app.id}`);
    doc.text(`Company: ${app.legal_name}`);
    doc.text(`Email: ${app.contact_email}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown(2);

    doc
      .fontSize(16)
      .fillColor("#16a34a")
      .text(`Total Amount: ₹${app.total_amount}`);

    doc.moveDown(3);

    doc
      .fontSize(10)
      .fillColor("#888")
      .text("Thank you for choosing CIO Verified", { align: "center" });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};


/* =========================
   ACCEPT INVOICE
========================= */
export const acceptInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM invoices WHERE application_id = ? ORDER BY id DESC LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = rows[0];

    if (invoice.status !== "SENT") {
      return res.status(400).json({
        message: `Cannot accept invoice. Current status: ${invoice.status}`,
      });
    }

    await db.query(
      "UPDATE invoices SET status = 'ACCEPTED' WHERE id = ?",
      [invoice.id]
    );

    await db.query(
      "UPDATE applications SET status = 'INVOICE_ACCEPTED' WHERE id = ?",
      [id]
    );

    res.json({ message: "Invoice accepted. Awaiting payment." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting invoice" });
  }
};


/* =========================
   MARK AS PAID (ADMIN)
========================= */
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ update application
    await db.query(
      "UPDATE applications SET status = 'PAID' WHERE id = ?",
      [id]
    );

    // ✅ update invoice
    await db.query(
      "UPDATE invoices SET status = 'PAID' WHERE application_id = ?",
      [id]
    );

    res.json({ message: "Payment marked as PAID ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating payment" });
  }
};

/* =========================
   RAISE ISSUE
========================= */
export const raiseInvoiceIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    await db.query(
      `INSERT INTO invoice_issues (application_id, user_id, message, role)
       VALUES (?, ?, ?, ?)`,
      [id, req.user.id, message, req.user.role]
    );

    await db.query(
      `UPDATE applications SET status = 'ISSUE_RAISED' WHERE id = ?`,
      [id]
    );

    res.json({ message: "Issue raised successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to raise issue" });
  }
};


/* =========================
   GET ALL ISSUES (ADMIN)
========================= */
export const getInvoiceIssues = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ii.*, a.legal_name
      FROM invoice_issues ii
      JOIN applications a ON ii.application_id = a.id
      ORDER BY ii.created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: "Error fetching issues" });
  }
};


/* =========================
   RESOLVE ISSUE
========================= */
/* =========================
   RESOLVE ISSUE
========================= */
export const resolveInvoiceIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // mark issue resolved
    await db.query(
      `UPDATE invoice_issues 
       SET status = 'RESOLVED' 
       WHERE application_id = ?`,
      [id]
    );

    // 🔥 IMPORTANT CHANGE
    await db.query(
      `UPDATE applications 
       SET status = 'PRICING_DEFINED' 
       WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Issue resolved. Please update pricing.",
      openPricing: true   // 👈 KEY FLAG
    });

  } catch (err) {
    res.status(500).json({ message: "Error resolving issue" });
  }
};


/* =========================
   GET CHAT MESSAGES
========================= */
export const getIssueMessages = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching issues for application:", id);

    const [rows] = await db.query(
      `SELECT id, application_id, user_id, message, role, created_at
       FROM invoice_issues
       WHERE application_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    res.json(rows);

  } catch (err) {
    console.error("❌ GET ISSUE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/* =========================
   REPLY TO ISSUE
========================= */
export const replyToIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const role = req.user.role;

    if (!["SUPERADMIN", "ADMIN", "APPLICANT"].includes(role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.query(
      `INSERT INTO invoice_issues (application_id, user_id, message, role)
       VALUES (?, ?, ?, ?)`,
      [id, req.user.id, message, role]
    );

    res.json({ message: "Reply sent" });

  } catch (err) {
    res.status(500).json({ message: "Error sending reply" });
  }
};

/* =========================
   REJECT ISSUE
========================= */
export const rejectInvoiceIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 check if issue exists
    const [issues] = await db.query(
      "SELECT * FROM invoice_issues WHERE application_id = ?",
      [id]
    );

    if (!issues.length) {
      return res.status(404).json({ message: "No issue found" });
    }

    // ❌ mark issue rejected
    await db.query(
      `UPDATE invoice_issues 
       SET status = 'REJECTED' 
       WHERE application_id = ?`,
      [id]
    );

    // 🔥 move application back to invoice stage
    await db.query(
      `UPDATE applications 
       SET status = 'ISSUE_REJECTED' 
       WHERE id = ?`,
      [id]
    );

    res.json({ message: "Issue rejected successfully" });

  } catch (err) {
    console.error("❌ REJECT ISSUE ERROR:", err);
    res.status(500).json({ message: "Error rejecting issue" });
  }
};
export const generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
  `SELECT a.*, i.total_amount
   FROM applications a
   JOIN invoices i 
     ON i.id = (
       SELECT MAX(id)
       FROM invoices
       WHERE application_id = a.id
     )
   WHERE a.id = ?`,
  [id]
);

    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const app = rows[0];

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("Payment Receipt", { align: "center" });
    doc.moveDown();

    doc.text(`Application ID: ${app.id}`);
    doc.text(`Company: ${app.legal_name}`);
    doc.text(`Email: ${app.contact_email}`);
    doc.text(`Amount Paid: ₹${app.total_amount}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown(2);
    doc.text("Payment Verified Successfully ✅", { align: "center" });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating receipt" });
  }
};



export const sendReceiptEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT a.*, i.total_amount 
       FROM applications a
       JOIN invoices i ON i.id = (
         SELECT MAX(id)
         FROM invoices
         WHERE application_id = a.id
       )
       WHERE a.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const app = rows[0];

    await sendEmail({
      to: app.contact_email,
      subject: "Payment Receipt - CIO Verified",
      html: `
        <h2>Payment Received ✅</h2>
        <p>Application ID: ${app.id}</p>
        <p>Amount: ₹${app.total_amount}</p>
        <p>Your payment has been verified.</p>
      `,
    });

    res.json({ message: "Receipt sent to email 📧" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};