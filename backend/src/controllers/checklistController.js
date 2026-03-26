import db from "../config/db.js";
import { calculateChecklistScores } from "../services/checklistScoreService.js";
import { generateChecklistsForApplicationService } from "../services/checklistGenerationService.js";

/**
 * Generate checklists for all products + solutions under one application
 */
export const generateChecklistsForApplication = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { applicationId } = req.params;

    await conn.beginTransaction();

    const created = await generateChecklistsForApplicationService(applicationId, conn);

    await conn.commit();

    return res.status(201).json({
      message: "Checklists generated successfully",
      created,
    });
  } catch (error) {
    await conn.rollback();
    console.error("generateChecklistsForApplication error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate checklists",
    });
  } finally {
    conn.release();
  }
};

export const saveChecklistResponses = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;
    const { assessment_date, notes, responses = [] } = req.body;

    await conn.beginTransaction();

    const [checklistRows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!checklistRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Checklist not found" });
    }

    for (const item of responses) {
      await conn.query(
        `UPDATE checklist_response_items
         SET awarded_score = ?,
             critical_item = ?,
             status = ?,
             observation = ?,
             risk_note = ?,
             recommendation = ?,
             evidence_ref = ?,
             comments = ?,
             assessor_updated_by = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND checklist_id = ?`,
        [
          item.awarded_score ?? 0,
          item.critical_item ?? false,
          item.status ?? "completed",
          item.observation ?? null,
          item.risk_note ?? null,
          item.recommendation ?? null,
          item.evidence_ref ?? null,
          item.comments ?? null,
          req.user.id,
          item.id,
          checklistId,
        ]
      );
    }

    await conn.query(
      `UPDATE assessment_checklists
       SET assessment_date = ?,
           notes = ?,
           status = 'IN_PROGRESS',
           evaluation_status = 'IN_PROGRESS',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [assessment_date || null, notes || null, checklistId]
    );

    await conn.commit();

    return res.json({
      message: "Checklist responses saved successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error("saveChecklistResponses error:", error);
    return res.status(500).json({
      message: "Failed to save checklist responses",
    });
  } finally {
    conn.release();
  }
};

export const submitChecklistForReview = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;

    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Checklist not found" });
    }

    const scoreSummary = await calculateChecklistScores(checklistId, conn);

    await conn.query(
      `UPDATE assessment_checklists
       SET status = 'SUBMITTED',
           evaluation_status = 'COMPLETED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [checklistId]
    );

    await conn.commit();

    return res.json({
      message: "Checklist submitted for review",
      scoreSummary,
    });
  } catch (error) {
    await conn.rollback();
    console.error("submitChecklistForReview error:", error);
    return res.status(500).json({
      message: "Failed to submit checklist for review",
    });
  } finally {
    conn.release();
  }
};

export const finalizeChecklistReview = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;
    const { review_comments, action } = req.body;

    if (!["REVIEWED", "REWORK_REQUIRED", "FINALIZED"].includes(action)) {
      return res.status(400).json({ message: "Invalid review action" });
    }

    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Checklist not found" });
    }

    const checklist = rows[0];

    const [reviewerAccessRows] = await conn.query(
      `SELECT id
       FROM assessment_checklists
       WHERE id = ?
         AND assigned_reviewer_id = ?`,
      [checklistId, req.user.id]
    );

    if (!reviewerAccessRows.length) {
      await conn.rollback();
      return res.status(403).json({ message: "You are not assigned to review this checklist" });
    }

    await conn.query(
      `UPDATE assessment_checklists
       SET review_comments = ?,
           status = ?,
           reviewed_at = CASE
             WHEN reviewed_at IS NULL THEN CURRENT_TIMESTAMP
             ELSE reviewed_at
           END,
           finalized_at = CASE
             WHEN ? = 'FINALIZED' THEN CURRENT_TIMESTAMP
             ELSE finalized_at
           END,
           evaluation_status = CASE
             WHEN ? = 'REWORK_REQUIRED' THEN 'IN_PROGRESS'
             ELSE evaluation_status
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        review_comments || null,
        action,
        action,
        action,
        checklistId,
      ]
    );

    await conn.query(
      `INSERT INTO assessment_outcome_history (
        checklist_id,
        previous_status,
        new_status,
        previous_certification_status,
        new_certification_status,
        previous_certification_band,
        new_certification_band,
        remarks,
        action_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        checklistId,
        checklist.status,
        action,
        checklist.certification_status,
        checklist.certification_status,
        checklist.certification_band,
        checklist.certification_band,
        review_comments || null,
        req.user.id,
      ]
    );

    await conn.commit();

    return res.json({
      message:
        action === "REWORK_REQUIRED"
          ? "Checklist returned to auditor for rework"
          : `Checklist ${action.toLowerCase()} successfully`,
    });
  } catch (error) {
    await conn.rollback();
    console.error("finalizeChecklistReview error:", error);
    return res.status(500).json({ message: "Failed to complete review action" });
  } finally {
    conn.release();
  }
};
export const getChecklistsByApplication = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { applicationId } = req.params;

    const [rows] = await conn.query(
      `SELECT *
       FROM assessment_checklists
       WHERE application_id = ?
       ORDER BY id ASC`,
      [applicationId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("getChecklistsByApplication error:", error);
    return res.status(500).json({ message: "Failed to fetch checklists" });
  } finally {
    conn.release();
  }
};

export const getChecklistById = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;

    const [checklistRows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!checklistRows.length) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    const [items] = await conn.query(
      `SELECT *
       FROM checklist_response_items
       WHERE checklist_id = ?
       ORDER BY id ASC`,
      [checklistId]
    );

    const [pillarScores] = await conn.query(
      `SELECT *
       FROM assessment_pillar_scores
       WHERE checklist_id = ?
       ORDER BY id ASC`,
      [checklistId]
    );

    return res.json({
      checklist: checklistRows[0],
      items,
      pillarScores,
    });
  } catch (error) {
    console.error("getChecklistById error:", error);
    return res.status(500).json({ message: "Failed to fetch checklist" });
  } finally {
    conn.release();
  }
};

export const getChecklistWorkspace = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;

    const [checklistRows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!checklistRows.length) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    const checklist = checklistRows[0];

    const [applicationRows] = await conn.query(
      `SELECT * FROM applications WHERE id = ?`,
      [checklist.application_id]
    );

    const [companyRows] = await conn.query(
      `SELECT * FROM companies WHERE id = ?`,
      [checklist.company_id]
    );

    let entityRows = [];

    if (checklist.entity_type === "product") {
      [entityRows] = await conn.query(
        `SELECT * FROM products WHERE id = ?`,
        [checklist.entity_id]
      );
    } else if (checklist.entity_type === "solution") {
      [entityRows] = await conn.query(
        `SELECT * FROM solutions WHERE id = ?`,
        [checklist.entity_id]
      );
    }

    const [items] = await conn.query(
      `SELECT *
       FROM checklist_response_items
       WHERE checklist_id = ?
       ORDER BY id ASC`,
      [checklistId]
    );

    const [pillarScores] = await conn.query(
      `SELECT *
       FROM assessment_pillar_scores
       WHERE checklist_id = ?
       ORDER BY id ASC`,
      [checklistId]
    );

    return res.json({
      checklist,
      application: applicationRows[0] || null,
      company: companyRows[0] || null,
      entity: entityRows[0] || null,
      items,
      pillarScores,
    });
  } catch (error) {
    console.error("getChecklistWorkspace error:", error);
    return res.status(500).json({ message: "Failed to fetch checklist workspace" });
  } finally {
    conn.release();
  }
};

export const calculateChecklistPreview = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { checklistId } = req.params;

    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT * FROM assessment_checklists WHERE id = ?`,
      [checklistId]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Checklist not found" });
    }

    const scoreSummary = await calculateChecklistScores(checklistId, conn);

    const [pillarScores] = await conn.query(
      `SELECT *
       FROM assessment_pillar_scores
       WHERE checklist_id = ?
       ORDER BY id ASC`,
      [checklistId]
    );

    // Keep checklist in draft/in-progress mode; do not submit
    await conn.commit();

    return res.json({
      message: "Official backend preview calculated successfully",
      scoreSummary,
      pillarScores,
    });
  } catch (error) {
    await conn.rollback();
    console.error("calculateChecklistPreview error:", error);
    return res.status(500).json({
      message: "Failed to calculate official preview",
    });
  } finally {
    conn.release();
  }
};