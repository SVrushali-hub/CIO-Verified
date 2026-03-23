import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/superadmin.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch {
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* 🔥 TOGGLE ACTIVE / INACTIVE */
  const toggleStatus = async (id, isActive) => {
    try {
      if (isActive) {
        await API.patch(`/admin/deactivate/${id}`);
      } else {
        await API.patch(`/admin/activate/${id}`);
      }

      fetchUsers();
    } catch {
      alert("Action failed");
    }
  };

  return (
    <div className="sa-container">
      <h2>Internal Users</h2>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Groups</th> {/* 🔥 NEW */}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name || "-"}</td>
                <td>{u.username}</td>
                <td>{u.email || "-"}</td>

                {/* 🔥 AUTH GROUPS */}
                <td>
                  {u.auth_groups
                    ? u.auth_groups.split(",").map((g, i) => (
                        <span key={i} className="group-badge">
                          {g}
                        </span>
                      ))
                    : "-"}
                </td>

                <td>
                  <span
                    className={`status ${
                      u.is_active ? "active" : "inactive"
                    }`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  {currentUser?.id !== u.id && (
                    <>
                      <button
                        className={`action-btn ${
                          u.is_active ? "deactivate" : "activate"
                        }`}
                        onClick={() =>
                          toggleStatus(u.id, u.is_active)
                        }
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>

                      {/* 🔥 NEW BUTTON */}
                      <button
                        className="action-btn manage"
                        onClick={() =>
                          navigate(
                            `/internal/superadmin/permissions/${u.id}`
                          )
                        }
                      >
                        Permissions
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}