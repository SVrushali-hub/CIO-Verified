import db from "../config/db.js";
import { generateChecklistsForApplicationService } from "../services/checklistGenerationService.js";

export const getAuditorApplicationDetails = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { applicationId } = req.params;
    const auditorId = req.user.id;

    const [assignmentRows] = await conn.query(
      `SELECT * 
       FROM application_assignments
       WHERE application_id = ?
         AND user_id = ?
         AND role = 'auditor'`,
      [applicationId, auditorId]
    );

    if (!assignmentRows.length) {
      return res.status(403).json({ message: "You are not assigned to this application" });
    }

    const [applicationRows] = await conn.query(
      `SELECT * FROM applications WHERE id = ?`,
      [applicationId]
    );

    if (!applicationRows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = applicationRows[0];

    const [companyRows] = await conn.query(
      `SELECT * FROM companies WHERE id = ?`,
      [application.company_id]
    );

    const [products] = await conn.query(
      `SELECT * FROM products WHERE application_id = ?`,
      [applicationId]
    );

    const [solutions] = await conn.query(
      `SELECT * FROM solutions WHERE application_id = ?`,
      [applicationId]
    );

    const [checklists] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE application_id = ?`,
      [applicationId]
    );

    return res.json({
      application,
      company: companyRows[0] || null,
      products,
      solutions,
      checklists,
    });
  } catch (error) {
    console.error("getAuditorApplicationDetails error:", error);
    return res.status(500).json({ message: "Failed to fetch application details" });
  } finally {
    conn.release();
  }
};
export const getAssignedApplications = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const auditorId = req.user.id;

    const [rows] = await conn.query(
      `SELECT 
        a.id AS application_id,
        c.company_name,
        a.status
       FROM application_assignments aa
       JOIN applications a ON aa.application_id = a.id
       JOIN companies c ON a.company_id = c.id
       WHERE aa.user_id = ?
         AND aa.role = 'auditor'`,
      [auditorId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("getAssignedApplications error:", error);
    return res.status(500).json({ message: "Failed to fetch applications" });
  } finally {
    conn.release();
  }
};
export const startAuditForApplication = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { applicationId } = req.params;
    const auditorId = req.user.id;

    await conn.beginTransaction();

    const [assignmentRows] = await conn.query(
      `SELECT * 
       FROM application_assignments
       WHERE application_id = ?
         AND user_id = ?
         AND role = 'auditor'`,
      [applicationId, auditorId]
    );

    if (!assignmentRows.length) {
      await conn.rollback();
      return res.status(403).json({ message: "You are not assigned to this application" });
    }

    const [applicationRows] = await conn.query(
      `SELECT * FROM applications WHERE id = ?`,
      [applicationId]
    );

    if (!applicationRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Application not found" });
    }

    const application = applicationRows[0];

    const [companyRows] = await conn.query(
      `SELECT * FROM companies WHERE id = ?`,
      [application.company_id]
    );

    const [existingChecklists] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE application_id = ?`,
      [applicationId]
    );

    if (!existingChecklists.length) {
      await generateChecklistsForApplicationService(applicationId, conn);
    }

    const [products] = await conn.query(
      `SELECT * FROM products WHERE application_id = ?`,
      [applicationId]
    );

    const [solutions] = await conn.query(
      `SELECT * FROM solutions WHERE application_id = ?`,
      [applicationId]
    );

    const [checklists] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE application_id = ? ORDER BY id ASC`,
      [applicationId]
    );

    await conn.commit();

    return res.json({
      message: "Audit data loaded successfully",
      application,
      company: companyRows[0] || null,
      products,
      solutions,
      checklists,
    });
  } catch (error) {
    await conn.rollback();
    console.error("startAuditForApplication error:", error);
    return res.status(500).json({
      message: error.message || "Failed to start audit",
    });
  } finally {
    conn.release();
  }
};
