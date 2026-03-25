import db from "../config/db.js";

/* =========================
GET ALL SUBMITTED PROFILES
========================= */
export const getSubmittedAssessors = async (req, res) => {
try {
const [rows] = await db.query("SELECT  apt.*, ai.email, ai.role, ai.status as invitation_status FROM assessor_profiles_temp apt JOIN assessor_invitations ai  ON apt.invitation_id = ai.id WHERE ai.status = 'FILLED'");

res.json(rows);

} catch (err) {
console.error(err);
res.status(500).json({ message: "Error fetching assessors" });
}
};

/* =========================
ADMIN DECISION
========================= */
export const adminDecision = async (req, res) => {
try {
const { invitation_id, decision } = req.body;

if (!invitation_id || !decision) {
  return res.status(400).json({ message: "Invalid data" });
}

// decision = APPROVED / REJECTED
await db.query(`
  UPDATE assessor_invitations
  SET admin_decision = ?, status = 'ADMIN_APPROVED'
  WHERE id = ?
`, [decision, invitation_id]);

res.json({ message: "Admin decision saved" });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Error" });
}
};