import db from "../config/db.js";

export const loadPermissions = async (req, res, next) => {
  try {
    const user = req.user;

    // 🔥 SUPERADMIN → full access
    if (user.role === "SUPERADMIN") {
      req.permissions = ["ALL"];
      return next();
    }

    /* =========================
       1. GROUP PERMISSIONS
    ========================= */
    const [groupPerms] = await db.query(`
      SELECT p.name
      FROM user_auth_groups uag
      JOIN auth_group_permissions agp ON uag.group_id = agp.group_id
      JOIN permissions p ON agp.permission_id = p.id
      WHERE uag.user_id = ?
    `, [user.id]);

    /* =========================
       2. DIRECT USER PERMISSIONS
    ========================= */
    const [userPerms] = await db.query(`
      SELECT p.name, up.is_revoked
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ?
    `, [user.id]);

    /* =========================
       3. MERGE LOGIC
    ========================= */
    const permissionsSet = new Set();

    // ✅ Add group permissions
    groupPerms.forEach(p => permissionsSet.add(p.name));

    // ✅ Apply user overrides
    userPerms.forEach(p => {
      if (p.is_revoked) {
        permissionsSet.delete(p.name); // remove
      } else {
        permissionsSet.add(p.name); // add
      }
    });

    // ✅ attach to request
    req.permissions = Array.from(permissionsSet);

    console.log("FINAL PERMISSIONS:", req.permissions); // 🔥 debug

    next();

  } catch (err) {
    console.error("LOAD PERMISSIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CHECK PERMISSION
========================= */
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === "SUPERADMIN") return next();

    if (!req.permissions?.includes(permission)) {
      return res.status(403).json({
        message: `Permission denied: ${permission}`
      });
    }

    next();
  };
};