import { useState, useEffect } from "react";
import API from "../../../services/api";
  import "../../../styles/createUser.css";


export default function CreateUser() {
  const [form, setForm] = useState({
    username: "",
    auth_groups: [],
  });

  const [auto, setAuto] = useState(true);
  const [generated, setGenerated] = useState(null);
  const [groups, setGroups] = useState([]);

  // 🔹 Fetch auth groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/admin/auth-groups");
        setGroups(res.data);
      } catch {
        alert("Failed to load groups");
      }
    };

    fetchGroups();
  }, []);

  const generateUsername = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `user_${random}`;
  };

  // 🔹 Handle group selection
  const handleGroupChange = (groupName) => {
    setForm((prev) => {
      const exists = prev.auth_groups.includes(groupName);

      return {
        ...prev,
        auth_groups: exists
          ? prev.auth_groups.filter((g) => g !== groupName)
          : [...prev.auth_groups, groupName],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let username = form.username;

      if (auto) {
        username = generateUsername();
      }

      if (form.auth_groups.length === 0) {
        return alert("Select at least one auth group");
      }

      const res = await API.post("/admin/create-user", {
        username,
        auth_groups: form.auth_groups,
      });

      setGenerated(res.data);

    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };


return (
  <div className="cu-container">
    <h2>Create Internal User</h2>

    <form className="cu-form" onSubmit={handleSubmit}>
      
      {/* Auto Username */}
      <div className="cu-auto">
  <input
    type="checkbox"
    checked={auto}
    onChange={() => setAuto(!auto)}
  />
  <span>Auto-generate username</span>
</div>

      {!auto && (
        <input
          className="cu-input"
          placeholder="Enter username"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          required
        />
      )}

      {/* Auth Groups */}
      <div className="cu-groups">
        <h4>Select Auth Groups</h4>

        {groups.map((group) => (
          <label key={group.id} className="cu-group-item">
            <input
              type="checkbox"
              checked={form.auth_groups.includes(group.name)}
              onChange={() => handleGroupChange(group.name)}
            />
            <span>{group.name}</span>
          </label>
        ))}
      </div>

      <button
        className="cu-btn"
        disabled={form.auth_groups.length === 0}
      >
        Create User
      </button>
    </form>

    {/* Credentials */}
    {generated && (
      <div className="cu-credentials">
        <h3>Credentials</h3>
        <p><b>Username:</b> {generated.username}</p>
        <p><b>Password:</b> {generated.tempPassword}</p>
        <p><b>Login:</b> /internal-login</p>
      </div>
    )}
  </div>
);
}