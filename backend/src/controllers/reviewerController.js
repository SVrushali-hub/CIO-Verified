import db from "../config/db.js";

export const getReviewerApplications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        id AS applicationId,
        legal_name AS companyName,
        status
      FROM applications
      WHERE assigned_reviewer_id = ?
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Reviewer applications error:", err);
    res.status(500).json({ message: "Failed to fetch reviewer applications" });
  }
};

export const getReviewerAssignedChecklists = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const reviewerId = req.user.id;

    const [rows] = await conn.query(
      `SELECT
         ac.id AS checklist_id,
         ac.application_id,
         ac.entity_type,
         ac.entity_name,
         ac.checklist_type,
         ac.category,
         ac.subcategory,
         ac.status,
         ac.total_score,
         ac.percentage_score,
         ac.certification_status,
         ac.certification_band,
         c.company_name
       FROM assessment_checklists ac
       LEFT JOIN companies c ON ac.company_id = c.id
       WHERE ac.assigned_reviewer_id = ?
         AND ac.status IN ('SUBMITTED', 'REVIEWED')
       ORDER BY ac.updated_at DESC, ac.id DESC`,
      [reviewerId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("getReviewerAssignedChecklists error:", error);
    return res.status(500).json({ message: "Failed to fetch reviewer checklists" });
  } finally {
    conn.release();
  }
};