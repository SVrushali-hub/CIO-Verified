import { useState } from "react";
import API from "../../../services/api";

export default function InviteAssessor() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("AUDITOR");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email) {
      return alert("Please enter email");
    }

    try {
      setLoading(true);

      await API.post("/invite-assessor", {
        email,
        role,
      });

      alert(`${role} invited successfully`);
      setEmail("");

    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h2>Invite Assessor</h2>

      <form onSubmit={handleInvite} style={{ marginTop: "20px" }}>

        {/* ROLE SELECT */}
        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        >
          <option value="AUDITOR">Auditor</option>
          <option value="REVIEWER">Reviewer</option>
        </select>

        {/* EMAIL */}
        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#ff6600",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>

      </form>
    </div>
  );
}