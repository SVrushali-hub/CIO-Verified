import { useNavigate } from "react-router-dom";
import "../../../styles/superadmin.css";
import { Users, UserPlus, ShieldCheck, FileText, CheckCircle } from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Create User",
      desc: "Add new internal team members",
      icon: <UserPlus size={28} />,
      route: "/internal/superadmin/create-user",
    },
    {
      title: "User Management",
      desc: "View, reset, deactivate users",
      icon: <Users size={28} />,
      route: "/internal/superadmin/users",
    },
    {
      title: "Manage Permissions",
      desc: "Grant or revoke permissions",
      icon: <ShieldCheck size={28} />,
      route: "/internal/superadmin/manage-permissions",
    },
    {
      title: "Verify Auditors",
      desc: "Approve or reject applications",
      icon: <CheckCircle size={28} />,
      route: "/internal/superadmin/verify-auditors",
    },
    {
      title: "Applications",
      desc: "View and manage applications",
      icon: <FileText size={28} />,
      route: "/internal/applications",
    },
  ];

  return (
    <div className="sa-container">
      <div className="sa-header">
        <h1>Super Admin Dashboard</h1>
        <p>Manage users, permissions, and system workflows</p>
      </div>

      <div className="sa-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="sa-card"
            onClick={() => navigate(card.route)}
          >
            <div className="sa-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}