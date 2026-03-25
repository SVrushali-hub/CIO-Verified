import { useEffect, useState } from "react";
import API from "../../../services/api";
import { hasPermission } from "../../../utils/permissions";
import { useNavigate } from "react-router-dom";
import "../../../styles/admin.css";

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

      const allowedPermissions =
        currentUser?.permissions
          ?.filter((p) => p.isAllowed)
          .map((p) => p.name) || [];

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
    <div className="admin-container">
      <h2 className="admin-title">Admin Dashboard</h2>

      {/* STATS */}
      <div className="stats-grid">
        <Card title="Total Applications" value={stats.total} />
        <Card title="Pending Screening" value={stats.pending} />
        <Card title="Payment Pending" value={stats.paymentPending} />
        <Card title="Completed" value={stats.completed} />
      </div>

      {/* ACTIONS */}
      <h3 className="section-title">Quick Actions</h3>

      <div className="actions-grid">

        {(hasPermission({ ...user, permissions }, "invite_auditor") ||
          hasPermission({ ...user, permissions }, "invite_reviewer")) && (
          <ActionCard
            title="Invite Assessor"
            onClick={() => navigate("/internal/admin/invite-assessor")}
          />
        )}

        {hasPermission({ ...user, permissions }, "assign_auditor") && (
          <ActionCard
            title="Assign Auditor"
            onClick={() => navigate("/internal/applications")}
          />
        )}

        {hasPermission({ ...user, permissions }, "assign_reviewer") && (
          <ActionCard
            title="Assign Reviewer"
            onClick={() => navigate("/internal/applications")}
          />
        )}

        {hasPermission({ ...user, permissions }, "review_assessor_application") && (
          <ActionCard
            title="Review Applications"
            onClick={() => navigate("/internal/admin/assessor-approval")}
          />
        )}

        {hasPermission({ ...user, permissions }, "generate_invoice") && (
          <ActionCard
            title="Finance Panel"
            onClick={() => navigate("/internal/admin/invoices")}
          />
        )}

        {hasPermission({ ...user, permissions }, "view_applications") && (
          <ActionCard
            title="View Applications"
            onClick={() => navigate("/internal/applications")}
          />
        )}
      </div>
    </div>
  );
}

/* 🔥 Stats Card */
function Card({ title, value }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

/* 🔥 Action Card */
function ActionCard({ title, onClick }) {
  return (
    <div className="action-card" onClick={onClick}>
      <h4>{title}</h4>
    </div>
  );
}