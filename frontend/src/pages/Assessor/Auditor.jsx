import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/assessorApplications.css";

function AuditorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auditor/applications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to fetch applications");
          return;
        }

        setApplications(data);
      } catch (err) {
        console.error(err);
        alert("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStartAudit = async (applicationId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/auditor/application/${applicationId}/start-audit`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to start audit");
      return;
    }

    console.log("Audit data:", data);

    // later you can navigate to checklist page
    navigate(`/assessor/audit/${applicationId}`, { state: data });
  } catch (err) {
    console.error("Start audit error:", err);
    alert("Server error");
  }
};

  if (loading) {
    return <div className="application-loading">Loading applications...</div>;
  }

  if (!applications.length) {
    return <div className="application-empty">No applications allocated.</div>;
  }

  return (
    <div className="application-container">
      <h2>Applications Allocated to You (Auditor)</h2>

      <table className="application-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Company Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
         
        {applications.map((app) => (
  <tr key={app.application_id}>
    <td>{app.application_id}</td>
    <td>{app.company_name}</td>
    <td>
      <button onClick={() => handleStartAudit(app.application_id)}>
        Start Audit
      </button>
    </td>
  </tr>
))}
          </tbody>
      </table>
    </div>
  );
}

export default AuditorApplications;