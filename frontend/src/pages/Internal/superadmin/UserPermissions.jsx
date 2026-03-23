import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/superadmin.css";

export default function UserPermissions() {
  const { id } = useParams();
  const [permissions, setPermissions] = useState([]);

  const fetchPermissions = async () => {
    try {
      const res = await API.get(`/admin/user-permissions/${id}`);
      setPermissions(res.data);
    } catch {
      alert("Failed to load permissions");
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const togglePermission = async (perm) => {
    try {
      await API.post("/admin/update-permission", {
        userId: id,
        permissionId: perm.id,
        is_revoked: !perm.is_revoked,
      });

      fetchPermissions();
    } catch {
      alert("Failed to update permission");
    }
  };

  return (
    <div className="sa-container">
      <h2>User Permissions</h2>

      <div className="permissions-box">
        {permissions.map((p) => (
          <div key={p.id} className="perm-row">
  <input
    type="checkbox"
    checked={!p.is_revoked}
    onChange={() => togglePermission(p)}
  />

  <span className="perm-name">{p.name}</span>
</div>
        ))}
      </div>
    </div>
  );
}