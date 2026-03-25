import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/dashboard.css";

function CompanyDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ get latest application
  const latestApp = applications[0];

  return (
    <div className="dashboard-wrapper">
      <h2>Company Dashboard</h2>

      <div className="dashboard-grid">

        {/* NEW APPLICATION */}
        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/apply")}
        >
          <div className="icon">📜</div>
          <h3>New Application</h3>
          <p>Apply for certification</p>
        </div>

        {/* 🔥 APPLICATION STATUS */}
        <div
          className="dashboard-box"
          onClick={() => {
            if (!latestApp) {
              alert("No application found");
              return;
            }
            navigate(`/dashboard/application/${latestApp.id}`);
          }}
        >
          <div className="icon">📊</div>
          <h3>Application Status</h3>
          <p>Track your application progress</p>
        </div>

        {/* CERTIFICATES */}
        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/certificates")}
        >
          <div className="icon">🏆</div>
          <h3>Certificates</h3>
          <p>Download approved certificates</p>
        </div>

        {/* PROFILE */}
        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/company-profile")}
        >
          <div className="icon">👤</div>
          <h3>Company Profile</h3>
          <p>Manage company info</p>
        </div>

      </div>
    </div>
  );
}

export default CompanyDashboard;
