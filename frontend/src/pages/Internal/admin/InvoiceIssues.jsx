import { useEffect, useState } from "react";
import API from "../../../services/api";
import "../../../styles/adminIssues.css";

function InvoiceIssues() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await API.get("/invoices/issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load issues");
    }
  };

  const resolveIssue = async (id) => {
    try {
      await API.post(`/invoices/resolve/${id}`);
      alert("Marked as resolved ✅");
      fetchIssues();
    } catch {
      alert("Failed");
    }
  };

  return (
    <div className="issues-wrapper">
      <h2>Invoice Issues</h2>

      <table className="issues-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Company</th>
            <th>Message</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>#{issue.application_id}</td>
              <td>{issue.legal_name}</td>
              <td>{issue.message}</td>

              <td>
                <span className={`status ${issue.status.toLowerCase()}`}>
                  {issue.status}
                </span>
              </td>

              <td>
                {issue.status === "OPEN" && (
                  <button
                    className="btn-resolve"
                    onClick={() => resolveIssue(issue.id)}
                  >
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceIssues;