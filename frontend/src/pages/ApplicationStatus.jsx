import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/applicationstatus.css";

const baseSteps = [
  { key: "SUBMITTED", label: "Application Submitted", msg: "Your application has been received." },
  { key: "UNDER_REVIEW_OPS", label: "Under Initial Review", msg: "Our team is reviewing your details." },
  { key: "PRICING_DEFINED", label: "Pricing Finalized", msg: "Pricing has been determined." },
  { key: "INVOICE_SENT", label: "Invoice Sent", msg: "Invoice has been shared with you." },
  { key: "INVOICE_ACCEPTED", label: "Invoice Accepted", msg: "Waiting for payment verification." },
  { key: "PAID", label: "Payment Completed", msg: "Payment received successfully." },
  { key: "AUDITOR_ASSIGNED", label: "Assessor Assigned", msg: "An assessor has been assigned." },
  { key: "AUDIT_COMPLETED", label: "Assessment Completed", msg: "Assessment process completed." },
  { key: "FINAL_REVIEW", label: "Final Review", msg: "Waiting for final approval." },
  { key: "FINAL_APPROVED", label: "Approved 🎉", msg: "Your application has been approved 🎉" },
];

export default function ApplicationStatus() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [raiseIssue, setRaiseIssue] = useState(null);
  const [issueText, setIssueText] = useState("");

  // ✅ USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");

      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setApplications(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCard = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const handleAccept = async (id) => {
    try {
      await API.post(`/invoices/accept/${id}`);
      alert("Invoice accepted ✅");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept invoice");
    }
  };

  const submitIssue = async (id) => {
    if (!issueText.trim()) return alert("Please enter issue");

    try {
      await API.post(`/invoices/issue/${id}`, { message: issueText });
      alert("Issue sent ✅");

      setRaiseIssue(null);
      setIssueText("");
      fetchApplications();
    } catch {
      alert("Failed to send issue");
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/invoices/download/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      a.click();
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="status-page">
      <h2>Application Status</h2>

      {applications.map((app) => {
        if (app.status === "CANCELLED") {
          return (
            <div key={app.id} className="application-card cancelled">
              <div className="cancelled-banner">❌ Application Cancelled</div>
            </div>
          );
        }

        const isOpen = openId === app.id;

        /* ================= STEPS ================= */
        const dynamicSteps = [...baseSteps];

        if (app.status === "ISSUE_RAISED") {
          dynamicSteps.splice(4, 0, {
            key: "ISSUE_RAISED",
            label: "Issue Raised",
            msg: "You raised an issue. Waiting for admin response.",
          });
        }

        const getDisplayStatus = (status) => {
          if (status === "ISSUE_RAISED") return "ISSUE_RAISED";
          if (status === "ISSUE_RESOLVED") return "PRICING_DEFINED";
          if (status === "ISSUE_REJECTED") return "INVOICE_SENT";
          return status;
        };

        const currentIndex = Math.max(
          0,
          dynamicSteps.findIndex((s) => s.key === getDisplayStatus(app.status))
        );

        const currentStep = dynamicSteps[currentIndex];

        /* ================= LOGIC ================= */
        const isInvoiceStage =
          app.status === "INVOICE_SENT" || app.status === "ISSUE_REJECTED";

        const canRaiseIssue =
          app.status === "INVOICE_SENT" &&
          app.issue_status !== "RESOLVED" &&
          app.issue_status !== "RAISED";

        return (
          <div key={app.id} className="application-card">

            {/* HEADER */}
            <div className="card-header" onClick={() => toggleCard(app.id)}>
              <div>
                <p>Application #{app.id}</p>
                <span className={`status-badge ${app.status?.toLowerCase()}`}>
                  {app.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className={`arrow ${isOpen ? "open" : ""}`}>▼</div>
            </div>

            {/* BODY */}
            {isOpen && (
              <div className="card-body">

                {/* MESSAGE */}
                {currentStep && (
                  <div className="status-message">{currentStep.msg}</div>
                )}

                {/* TIMELINE */}
                <div className="timeline">
                  {dynamicSteps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                      <div
                        key={step.key}
                        className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                      >
                        <div className="timeline-circle">
                          {isCompleted ? "✓" : ""}
                        </div>
                        <div className="timeline-label">{step.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* ================= INVOICE ================= */}
                {isInvoiceStage && (
                  <div className="invoice-box">
                    <h3>Invoice</h3>
                    <p className="invoice-amount">₹{app.total_amount || 0}</p>

                    <div className="invoice-actions">
                      <button onClick={() => downloadInvoice(app.id)}>
                        Download
                      </button>

                      {app.status !== "INVOICE_ACCEPTED" && (
                        <button onClick={() => handleAccept(app.id)}>
                          Accept
                        </button>
                      )}

                      {app.status === "ISSUE_REJECTED" && (
                        <>
                          <button
                            className="btn-cancel-app"
                            onClick={async () => {
                              if (!window.confirm("Cancel this application?"))
                                return;

                              try {
                                await API.post(`/applications/cancel/${app.id}`);
                                alert("Application cancelled ❌");
                                fetchApplications();
                              } catch {
                                alert("Failed to cancel");
                              }
                            }}
                          >
                            Cancel Application
                          </button>

                          <p className="rejected-note">
                            Issue rejected. You can proceed or cancel.
                          </p>
                        </>
                      )}

                      {canRaiseIssue && (
                        <button onClick={() => setRaiseIssue(app.id)}>
                          Raise Issue
                        </button>
                      )}
                    </div>

                    {raiseIssue === app.id && (
                      <div className="issue-box">
                        <textarea
                          value={issueText}
                          onChange={(e) => setIssueText(e.target.value)}
                        />
                        <button onClick={() => submitIssue(app.id)}>
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ISSUE DISCUSSION */}
                {app.status === "ISSUE_RAISED" && (
                  <button
                    onClick={() => navigate(`/dashboard/issues/${app.id}`)}
                  >
                    Open Discussion
                  </button>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}