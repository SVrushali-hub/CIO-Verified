import db from "../config/db.js";

/* =========================
VALIDATE TOKEN
========================= */
export const validateToken = async (req, res) => {
try {
const { token } = req.query;

if (!token) {
  return res.status(400).json({ valid: false, message: "Token missing" });
}

const [rows] = await db.query(
  "SELECT * FROM assessor_invitations WHERE token = ? AND status = 'PENDING'",
  [token]
);

if (rows.length === 0) {
  return res.status(400).json({ valid: false });
}

res.json({
  valid: true,
  email: rows[0].email,
  role: rows[0].role
});

} catch (err) {
console.error("VALIDATE TOKEN ERROR:", err);
res.status(500).json({ message: "Error validating token" });
}
};

/* =========================
SUBMIT PROFILE (TEMP)
========================= */
export const submitProfile = async (req, res) => {
try {
const {
token,
full_name,
phone,
experience_years,
specialization,
address,
type,
company_name,
gstin,
years_in_operation
} = req.body;

// 🔥 BASIC VALIDATION
if (!token || !full_name || !phone || !experience_years || !specialization) {
  return res.status(400).json({ message: "Missing required fields" });
}

// 🔥 FILES (diskStorage → use path)
const resume = req.files?.resume?.[0]?.path || null;
const companyProfile = req.files?.company_profile?.[0]?.path || null;

// 🔥 GET INVITATION
const [inv] = await db.query(
  "SELECT * FROM assessor_invitations WHERE token = ?",
  [token]
);

if (inv.length === 0) {
  return res.status(400).json({ message: "Invalid token" });
}

const invitation = inv[0];

// ❌ Prevent resubmission
if (invitation.status !== "PENDING") {
  return res.status(400).json({
    message: "Form already submitted or expired"
  });
}

// 🔥 CHECK IF ALREADY EXISTS (double safety)
const [existing] = await db.query(
  "SELECT id FROM assessor_profiles_temp WHERE invitation_id = ?",
  [invitation.id]
);

if (existing.length > 0) {
  return res.status(400).json({
    message: "Profile already submitted"
  });
}

// 🔥 INSERT TEMP PROFILE
await db.query(
  `INSERT INTO assessor_profiles_temp
  (invitation_id, full_name, phone, experience_years, specialization, address, type, company_name, gstin, years_in_operation, resume, company_profile)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    invitation.id,
    full_name,
    phone,
    experience_years,
    specialization,
    address || null,
    type || "individual",
    company_name || null,
    gstin || null,
    years_in_operation || null,
    resume,
    companyProfile
  ]
);

// 🔥 UPDATE INVITATION STATUS
await db.query(
  "UPDATE assessor_invitations SET status = 'FILLED' WHERE id = ?",
  [invitation.id]
);

res.json({
  message: "Profile submitted successfully ✅"
});

} catch (err) {
console.error("SUBMIT PROFILE ERROR:", err);
res.status(500).json({ message: "Error submitting profile" });
}
};