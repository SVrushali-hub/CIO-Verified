import db from "../config/db.js";
import crypto from "crypto";
import { sendInviteEmail } from "../utils/mailer.js";

export const getAdminsWithPermissions = async (req, res) => {
  try {
    // ✅ use internal_users
 const [users] = await db.query(`
  SELECT iu.id, iu.user_id, u.email
  FROM internal_users iu
  JOIN users u ON iu.user_id = u.id
  WHERE u.role != 'SUPERADMIN'
`);

    // all permissions
    const [allPermissions] = await db.query(
      "SELECT id, name FROM permissions"
    );

    for (let user of users) {

  const [groups] = await db.query(`
    SELECT g.id, g.name
    FROM user_auth_groups ug
    JOIN auth_groups g ON g.id = ug.group_id
    WHERE ug.user_id = ?
  `, [user.user_id]); // ✅ FIX

  const [groupPerms] = await db.query(`
    SELECT gp.permission_id
    FROM auth_group_permissions gp
    JOIN user_auth_groups ug ON ug.group_id = gp.group_id
    WHERE ug.user_id = ?
  `, [user.user_id]); // ✅ FIX

  const [overrides] = await db.query(`
    SELECT permission_id, is_revoked
    FROM user_permissions
    WHERE user_id = ?
  `, [user.user_id]); // ✅ FIX
      // 🔥 MERGE LOGIC
      const finalMap = {};

      // group default = true
      groupPerms.forEach(p => {
        finalMap[p.permission_id] = true;
      });

      // override
      overrides.forEach(o => {
        finalMap[o.permission_id] = o.is_revoked ? false : true;
      });

      user.permissions = allPermissions.map(p => ({
        id: p.id,
        name: p.name,
        isAllowed: finalMap[p.id] || false
      }));

      user.groups = groups;
      user.role = user.role || "admin";
    }

    res.json(users);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ UPDATE PERMISSIONS (SMART OVERRIDE LOGIC)

export const updatePermissions = async (req, res) => {
  try {
    const { admin_id, permissions } = req.body;

    if (!admin_id || !permissions) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🔥 Loop through permissions
    for (const perm of permissions) {
      const { name, isAllowed } = perm;

      // 1. Get permission_id
      const [permRows] = await db.query(
        "SELECT id FROM permissions WHERE name = ?",
        [name]
      );

      if (permRows.length === 0) continue;

      const permission_id = permRows[0].id;

      // 2. Check if already exists
      const [existing] = await db.query(
        "SELECT id FROM user_permissions WHERE user_id = ? AND permission_id = ?",
        [admin_id, permission_id]
      );

      if (existing.length > 0) {
        // UPDATE
        await db.query(
          "UPDATE user_permissions SET is_revoked = ? WHERE user_id = ? AND permission_id = ?",
          [isAllowed ? 0 : 1, admin_id, permission_id]
        );
      } else {
        // INSERT
        await db.query(
          "INSERT INTO user_permissions (user_id, permission_id, is_revoked) VALUES (?, ?, ?)",
          [admin_id, permission_id, isAllowed ? 0 : 1]
        );
      }
    }

    res.json({ message: "Permissions updated successfully" });

  } catch (err) {
    console.error("UPDATE PERMISSION ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
};



export const inviteAssessor = async (req, res) => {
  try {
    const { email, role } = req.body;
    const adminId = req.user.id;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role required" });
    }

    if (role === "AUDITOR" && !req.permissions.includes("invite_auditor")) {
      return res.status(403).json({ message: "No permission to invite auditor" });
    }

    if (role === "REVIEWER" && !req.permissions.includes("invite_reviewer")) {
      return res.status(403).json({ message: "No permission to invite reviewer" });
    }

    const token = crypto.randomUUID();

    // save in DB
    await db.query(`
      INSERT INTO assessor_invitations (email, role, invited_by_admin_id, token)
      VALUES (?, ?, ?, ?)
    `, [email, role, adminId, token]);

    const link = `http://localhost:5173/assessor-form?token=${token}`;

    // 🔥 SEND EMAIL
    await sendInviteEmail(
      email,
      "You're invited as Assessor",
      `
        <h2>CIO Verified Invitation</h2>
        <p>You have been invited as <b>${role}</b>.</p>
        <p>Click below to complete your profile:</p>
        <a href="${link}">${link}</a>
        <br/><br/>
        <small>This link is valid for one-time use.</small>
      `
    );

    res.json({ message: "Invitation sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error inviting assessor" });
  }
};