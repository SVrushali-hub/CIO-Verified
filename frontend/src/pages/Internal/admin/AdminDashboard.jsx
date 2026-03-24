import { useEffect, useState } from "react";
import API from "../../../services/api";
import { hasPermission } from "../../../utils/permissions";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paymentPending: 0,
    completed: 0,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
console.log("LOGGED IN USER:", user);
  useEffect(() => {
    fetchStats();
    fetchPermissions();
  }, []);
const fetchPermissions = async () => {
  try {
    const res = await API.get("/admins-with-permissions");

    const currentUser = res.data.find(
      (u) => u.user_id === user.id
    );

    // 🔥 CONVERT TO STRING ARRAY
    const allowedPermissions =
      currentUser?.permissions
        ?.filter(p => p.isAllowed)
        .map(p => p.name) || [];

    console.log("ALLOWED:", allowedPermissions);

    setPermissions(allowedPermissions);

  } catch (err) {
    console.error(err);
  }
};
  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch {
      alert("Failed to load stats");
    }
  };

  return (
    
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Card title="Total Applications" value={stats.total} />
        <Card title="Pending Screening" value={stats.pending} />
        <Card title="Payment Pending" value={stats.paymentPending} />
        <Card title="Completed" value={stats.completed} />
      </div>

      {/* ACTIONS */}
      <h3 style={{ marginTop: "30px" }}>Actions</h3>

     <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>

  {(hasPermission({ ...user, permissions }, "invite_auditor") || 
    hasPermission({ ...user, permissions }, "invite_reviewer")) && (
    <button onClick={() => navigate("/internal/admin/invite-assessor")}>
      Invite Assessor
    </button>
  )}

  {hasPermission({ ...user, permissions }, "assign_auditor") && (
    <button onClick={() => navigate("/internal/operations/applications")}>
      Assign Auditor
    </button>
  )}

  {hasPermission({ ...user, permissions }, "assign_reviewer") && (
    <button onClick={() => navigate("/internal/operations/applications")}>
      Assign Reviewer
    </button>
  )}

  {hasPermission({ ...user, permissions }, "review_assessor_application") && (
    <button onClick={() => navigate("/internal/admin/assessor-approval")}>
      Review Assessor Applications
    </button>
  )}

  {hasPermission({ ...user, permissions }, "generate_invoice") && (
    <button onClick={() => navigate("/internal/admin/invoices")}>
      Finance Panel
    </button>
  )}

</div>
    </div>
    
  );
}

function Card({ title, value }) {
  return (
    
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #eee",
        width: "200px",
      }}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}