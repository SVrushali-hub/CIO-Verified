export default function AdminPermissionCard({ user, onToggle, onSave }) {
  return (
    <div className="perm-card">

      {/* HEADER */}
      <div className="perm-header">
        <h3>User ID: {user.id}</h3>
        <p>{user.email}</p>
        <span className="role-badge">{user.role}</span>
      </div>

      {/* GROUPS */}
      <div className="perm-section">
        <h4>Auth Groups</h4>

        <div className="group-list">
          {user.groups.length > 0 ? (
            user.groups.map(g => (
              <span key={g.id} className="group-badge">
                {g.name}
              </span>
            ))
          ) : (
            <p className="no-group">No Groups Assigned</p>
          )}
        </div>
      </div>

      {/* PERMISSIONS */}
      <div className="perm-section">
        <h4>Permissions</h4>

        <div className="perm-grid">
          {user.permissions.map((perm, index) => (
            <div key={perm.id} className="perm-item">

              <span className="perm-label">
                {perm.name.replace(/_/g, " ")}
              </span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={perm.isAllowed}
                  onChange={() => onToggle(user.id, index)}
                />
                <span className="slider"></span>
              </label>

            </div>
          ))}
        </div>
      </div>

      {/* ACTION */}
      <button className="save-btn" onClick={() => onSave(user)}>
        Save Changes
      </button>

    </div>
  );
}