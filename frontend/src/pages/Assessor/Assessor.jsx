import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
function AssessorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-container">
      <h1>Assessor Dashboard</h1>

      <div className="dashboard-grid">

       
        <div className="card" onClick={() => navigate("/assessor/profile")}>
          <div className="icon">👤</div>
          <h3>Profile</h3>
          <p>View and update your details</p>
        </div>

        <div className="card" onClick={() => navigate("/assessor/audit")}>
          <div className="icon">📋</div>
          <h3>Audit Queue</h3>
          <p>Start and manage audits</p>
        </div>

        <div className="card" onClick={() => navigate("/assessor/review")}>
          <div className="icon">🧾</div>
          <h3>Review Queue</h3>
          <p>Review submitted assessments</p>
        </div>
       
       
        <div className="card" onClick={() => navigate("/assessor/history")}>
          <div className="icon">📊</div>
          <h3>My Assessments</h3>
          <p>View completed audits & reviews</p>
        </div>

      </div>
    </div>
  );
}

export default AssessorDashboard;