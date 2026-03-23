import { useEffect, useState } from "react";
import { fetchAdmins, updatePermissions } from "../../../services/adminService";

export default function ManagePermissions() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await fetchAdmins();
    setUsers(Array.isArray(data) ? data : []);
  };

  // 🔥 Toggle on click
  const handleToggle = async (userId, permId) => {
    const updated = [...users];

    const user = updated.find(u => u.id === userId);
    const perm = user.permissions.find(p => p.id === permId);

    perm.isAllowed = !perm.isAllowed;

    setUsers(updated);

    // 🔥 AUTO SAVE (no button needed)
    await updatePermissions(userId, user.permissions);
  };

  // Get all permission names (header)
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
              <th key={p.id}>
                {p.name.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>

              {/* USER */}
              <td>
                <div className="user-cell">
                  <strong>{user.email}</strong>
                  <span className="role-badge">{user.role}</span>
                </div>
              </td>

              {/* GROUPS */}
              <td>
                {user.groups.length > 0 ? (
                  user.groups.map(g => (
                    <span key={g.id} className="group-badge">
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
                  key={perm.id}
                  className="perm-cell"
                  onClick={() => handleToggle(user.id, perm.id)}
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