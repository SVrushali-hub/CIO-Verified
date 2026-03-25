import { useEffect, useState } from "react";
import { fetchAdmins, updatePermissions } from "../../../services/adminService";
import "../../../styles/managePermission.css";

export default function ManagePermissions() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await fetchAdmins();
    setUsers(Array.isArray(data) ? data : []);
  };

  // 🔥 Toggle permission
  const handleToggle = async (userId, permId) => {
    const updated = [...users];

    const user = updated.find((u) => u.user_id === userId);
    if (!user) return;

    const perm = user.permissions.find((p) => p.id === permId);
    if (!perm) return;

    perm.isAllowed = !perm.isAllowed;
    setUsers(updated);

    try {
      const cleanPermissions = user.permissions.map((p) => ({
        name: p.name,
        isAllowed: p.isAllowed,
      }));

      await updatePermissions(userId, cleanPermissions);

      // update modal view also
      if (selectedUser && selectedUser.user_id === userId) {
        setSelectedUser({ ...user });
      }

    } catch (err) {
      console.error("Update failed:", err);

      perm.isAllowed = !perm.isAllowed;
      setUsers([...updated]);

      alert("Failed to update permission");
    }
  };

  return (
    <div className="table-container">
      <h2>Manage Permissions</h2>

      {/* 🔥 USER TABLE */}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Groups</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.email}</td>

                <td>
                  <span className="role-badge">{user.role}</span>
                </td>

                <td>
                  {user.groups?.length > 0 ? (
                    user.groups.map((g) => (
                      <span key={g.id} className="group-badge">
                        {g.name}
                      </span>
                    ))
                  ) : (
                    <span className="no-group">None</span>
                  )}
                </td>

                <td>
                  <button
                    className="manage-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 MODAL */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="perm-modal">
            <h3>{selectedUser.email}</h3>
            <span className="role-badge">{selectedUser.role}</span>

            <div className="perm-grid">
              {selectedUser.permissions.map((perm) => (
                <div className="perm-item" key={perm.id}>
                  <span>{perm.name.replace(/_/g, " ")}</span>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={perm.isAllowed}
                      onChange={() =>
                        handleToggle(selectedUser.user_id, perm.id)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <button
              className="close-btn"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}