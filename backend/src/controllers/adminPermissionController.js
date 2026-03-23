import db from "../config/db.js";


export const getAdminsWithPermissions = async (req, res) => {
  try {
    // ✅ use internal_users
 const [users] = await db.query(`
  SELECT iu.id, u.email
  FROM internal_users iu
  JOIN users u ON iu.user_id = u.id
  WHERE u.role != 'SUPERADMIN'
`);

    // all permissions
    const [allPermissions] = await db.query(
      "SELECT id, name FROM permissions"
    );

    for (let user of users) {

      // ✅ user_auth_groups
      const [groups] = await db.query(`
        SELECT g.id, g.name
        FROM user_auth_groups ug
        JOIN auth_groups g ON g.id = ug.group_id
        WHERE ug.user_id = ?
      `, [user.id]);

      // ✅ group permissions
      const [groupPerms] = await db.query(`
        SELECT gp.permission_id
        FROM auth_group_permissions gp
        JOIN user_auth_groups ug ON ug.group_id = gp.group_id
        WHERE ug.user_id = ?
      `, [user.id]);

      // ✅ user overrides
      const [overrides] = await db.query(`
        SELECT permission_id, is_revoked
        FROM user_permissions
        WHERE user_id = ?
      `, [user.id]);

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
      user.role = "admin";
    }

    res.json(users);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ UPDATE PERMISSIONS (SMART OVERRIDE LOGIC)
export const updatePermissions = async (req, res) => {
  const { admin_id, permissions } = req.body;

  try {

    // get group permissions
    const [groupPerms] = await db.query(`
      SELECT gp.permission_id
      FROM auth_group_permissions gp
      JOIN user_auth_groups ug ON ug.group_id = gp.group_id
      WHERE ug.user_id = ?
    `, [admin_id]);

    const groupSet = new Set(groupPerms.map(p => p.permission_id));

    for (let perm of permissions) {

      const isDefault = groupSet.has(perm.id);

      // if same as default → delete
      if ((isDefault && perm.isAllowed === true) ||
          (!isDefault && perm.isAllowed === false)) {

        await db.query(`
          DELETE FROM user_permissions
          WHERE user_id = ? AND permission_id = ?
        `, [admin_id, perm.id]);

      } else {
        // override
        await db.query(`
          INSERT INTO user_permissions (user_id, permission_id, is_revoked)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE is_revoked = ?
        `, [
          admin_id,
          perm.id,
          perm.isAllowed ? 0 : 1,
          perm.isAllowed ? 0 : 1
        ]);
      }
    }

    res.json({ message: "Permissions updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};