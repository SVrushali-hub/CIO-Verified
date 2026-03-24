import db from "../config/db.js";

export const loadPermissions = async (req, res, next) => {
  try {
    const user = req.user;

    // SUPERADMIN → full access
    if (user.role === "SUPERADMIN") {
      req.permissions = ["ALL"];
      return next();
    }

    const [rows] = await db.query(`
      SELECT p.name, COALESCE(up.is_revoked, 0) AS is_revoked
      FROM user_auth_groups uag
      JOIN auth_group_permissions agp ON uag.group_id = agp.group_id
      JOIN permissions p ON agp.permission_id = p.id
      LEFT JOIN user_permissions up 
        ON up.user_id = uag.user_id AND up.permission_id = p.id
      WHERE uag.user_id = ?
    `, [user.id]);

    // attach permissions
    req.permissions = rows
      .filter(r => r.is_revoked === 0)
      .map(r => r.name);

    next();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === "SUPERADMIN") return next();

    if (!req.permissions?.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};