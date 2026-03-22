import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";

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

  return (
    <div className="dashboard-wrapper">
      <h2>Company Dashboard</h2>

      {/* 🔥 TOP SUMMARY */}
      <div className="summary-cards">
        <div className="card">
          <h3>{applications.length}</h3>
          <p>Total Applications</p>
        </div>

        <div className="card">
          <h3>
            {
              applications.filter(a => a.status === "UNDER_VERIFICATION").length
            }
          </h3>
          <p>Under Review</p>
        </div>

        <div className="card">
          <h3>
            {
              applications.filter(a => a.status === "COMPLETED").length
            }
          </h3>
          <p>Approved</p>
        </div>
      </div>

      {/* ⚡ QUICK ACTIONS */}
      <div className="dashboard-grid">
        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/apply")}
        >
          <div className="icon">📜</div>
          <h3>New Application</h3>
          <p>Apply for certification</p>
        </div>

        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/certificates")}
        >
          <div className="icon">🏆</div>
          <h3>Certificates</h3>
          <p>Download approved certificates</p>
        </div>

        <div
          className="dashboard-box"
          onClick={() => navigate("/dashboard/profile")}
        >
          <div className="icon">👤</div>
          <h3>Company Profile</h3>
          <p>Manage company info</p>
        </div>
      </div>

      {/* 📊 APPLICATION LIST */}
      <h3 style={{ marginTop: "30px" }}>Your Applications</h3>

      <table className="app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.organisation_name}</td>
              <td>
                <span className={`status ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </td>
              <td>₹{app.total_amount || 0}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/dashboard/application/${app.id}`)
                  }
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompanyDashboard;