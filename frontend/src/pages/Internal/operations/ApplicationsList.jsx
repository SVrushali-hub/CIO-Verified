import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/applications.css";

function ApplicationsList() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (id) => {
    try {
      await API.post("/invoices/generate", {
        application_id: id,
      });

      alert("Invoice generated successfully");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (loading) return <p className="loading">Loading applications...</p>;

  return (
    <div className="applications-container">
      <h2>Applications</h2>

      <div className="table-wrapper">
        <table className="app-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                
                {/* COMPANY */}
                <td>
                  <div className="company-cell">
                    <span className="company-name">
                      {app.company_name || app.legal_name}
                    </span>
                  </div>
                </td>

                {/* STATUS */}
                <td>
                  <span className={`status-badge ${app.status.toLowerCase()}`}>
                    {app.status.replaceAll("_", " ")}
                  </span>
                </td>

                {/* ACTIONS */}
                <td>
                  <div className="actions">

                    {/* VIEW */}
                    <button
                      className="btn view"
                      onClick={() =>
                        navigate(`/internal/application/${app.id}`)
                      }
                    >
                      View
                    </button>

                    {/* 🔥 ISSUE */}
                    {app.status === "ISSUE_RAISED" && (
                      <button
                        className="btn issue"
                        onClick={() =>
                          navigate(`/internal/issues/${app.id}`)
                        }
                      >
                        ⚠ Issue
                      </button>
                    )}

                    {/* SUPERADMIN → SET PRICING */}
                    {user.role === "SUPERADMIN" &&
                      app.status === "SUBMITTED" && (
                        <button
                          className="btn pricing"
                          onClick={() =>
                            navigate(`/internal/application/${app.id}`)
                          }
                        >
                          Set Pricing
                        </button>
                      )}

                    {/* ADMIN → GENERATE INVOICE */}
                    {user.role === "ADMIN" &&
                      app.status === "PRICING_DEFINED" && (
                        <button
                          className="btn invoice"
                          onClick={() => generateInvoice(app.id)}
                        >
                          Generate Invoice
                        </button>
                      )}

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationsList;