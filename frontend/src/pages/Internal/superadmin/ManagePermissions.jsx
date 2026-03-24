import { useEffect, useState } from "react";
import { fetchAdmins, updatePermissions } from "../../../services/adminService";

export default function ManagePermissions() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
  console.log("USERS DATA:", users);
}, [users]);

  const loadUsers = async () => {
    const data = await fetchAdmins();
    setUsers(Array.isArray(data) ? data : []);
  };

  // 🔥 Toggle permission
  const handleToggle = async (userId, permId) => {
    const updated = [...users];

    // ✅ find correct user using user_id
    const user = updated.find(u => u.user_id === userId);
    if (!user) return;

    const perm = user.permissions.find(p => p.id === permId);
    if (!perm) return;

    // toggle UI
    perm.isAllowed = !perm.isAllowed;
    setUsers(updated);

    try {
      // ✅ CLEAN payload (IMPORTANT)
      const cleanPermissions = user.permissions.map(p => ({
        name: p.name,
        isAllowed: p.isAllowed
      }));

      await updatePermissions(userId, cleanPermissions);

    } catch (err) {
      console.error("Update failed:", err);

      // 🔥 rollback UI if error
      perm.isAllowed = !perm.isAllowed;
      setUsers([...updated]);

      alert("Failed to update permission");
    }
  };

  // Headers (permissions)
  const permissionHeaders =
    users.length > 0 ? users[0].permissions : [];

  return (
    <div className="table-container">
      <h2>Manage Permissions</h2>

      <table className="perm-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Groups</th>

            {permissionHeaders.map(p => (
              <th key={`header-${p.id}`}>
                {p.name.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>

              {/* USER */}
              <td>
                <div className="user-cell">
                  <strong>{user.email}</strong>
                  <span className="role-badge">{user.role}</span>
                </div>
              </td>

              {/* GROUPS */}
              <td>
                {user.groups?.length > 0 ? (
                  user.groups.map(g => (
                    <span
                      key={`${user.user_id}-${g.id}`}
                      className="group-badge"
                    >
                      {g.name}
                    </span>
                  ))
                ) : (
                  <span className="no-group">None</span>
                )}
              </td>

              {/* PERMISSIONS */}
              {user.permissions.map(perm => (
                <td
                  key={`${user.user_id}-${perm.id}`}
                  className="perm-cell"
                  onClick={() => handleToggle(user.user_id, perm.id)}
                  style={{ cursor: "pointer", textAlign: "center" }}
                >
                  {perm.isAllowed ? "✅" : "❌"}
                </td>
              ))}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}