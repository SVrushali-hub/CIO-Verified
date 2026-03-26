import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/checklistDetail.css";

const API_BASE = "http://localhost:5000/api";

function InfoRow({ label, value }) {
  return (
    <div className="checklist-info-row">
      <span className="checklist-info-label">{label}</span>
      <span className="checklist-info-value">{value || "N/A"}</span>
    </div>
  );
}

export default function ReviewerChecklistDetail() {
  const { checklistId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [reviewComments, setReviewComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/checklists/${checklistId}/workspace`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load checklist");
        }

        if (!mounted) return;

        setWorkspace(data);
        setReviewComments(data.checklist?.review_comments || "");
      } catch (err) {
        if (!mounted) return;
        console.error("Reviewer workspace error:", err);
        setError(err.message || "Server error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWorkspace();

    return () => {
      mounted = false;
    };
  }, [checklistId]);

  const handleReviewAction = async (action) => {
    try {
      setWorking(true);

      const res = await fetch(`${API_BASE}/checklists/${checklistId}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          action,
          review_comments: reviewComments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action.toLowerCase()} checklist`);
      }

      alert(data.message || "Review action completed");
      navigate("/assessor/review");
    } catch (err) {
      console.error("Reviewer action error:", err);
      alert(err.message || "Failed to complete review action");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="checklist-page">
        <div className="checklist-loading">Loading review workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checklist-page">
        <div className="checklist-error-card">
          <h3>Unable to load review workspace</h3>
          <p>{error}</p>
          <button className="checklist-secondary-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const checklist = workspace?.checklist;
  const application = workspace?.application;
  const company = workspace?.company;
  const entity = workspace?.entity;
  const items = workspace?.items || [];
  const pillarScores = workspace?.pillarScores || [];

  return (
    <div className="checklist-page">
      <div className="checklist-topbar">
        <div>
          <h2>Reviewer Workspace</h2>
          <p className="checklist-muted">
            Checklist #{checklist?.id} · {checklist?.entity_name}
          </p>
        </div>

        <button className="checklist-secondary-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="checklist-context-grid">
        <div className="checklist-panel">
          <h3>Application Context</h3>
          <InfoRow label="Application ID" value={application?.id} />
          <InfoRow label="Company Name" value={company?.company_name} />
          <InfoRow label="Legal Name" value={application?.legal_name} />
          <InfoRow label="Brand Name" value={application?.brand_name} />
          <InfoRow label="Website" value={application?.website} />
          <InfoRow label="Contact Name" value={application?.contact_name} />
          <InfoRow label="Contact Email" value={application?.contact_email} />
          <InfoRow label="Service Scope" value={application?.service_scope} />
        </div>

        <div className="checklist-panel">
          <h3>Checklist Context</h3>
          <InfoRow label="Checklist ID" value={checklist?.id} />
          <InfoRow label="Entity Type" value={checklist?.entity_type} />
          <InfoRow label="Entity Name" value={checklist?.entity_name} />
          <InfoRow label="Category" value={checklist?.category} />
          <InfoRow label="Subcategory" value={checklist?.subcategory} />
          <InfoRow label="Status" value={checklist?.status} />
          <InfoRow label="Certification Status" value={checklist?.certification_status} />
          <InfoRow label="Certification Band" value={checklist?.certification_band} />
          <InfoRow label="Total Score" value={checklist?.total_score} />
          <InfoRow label="Percentage" value={checklist?.percentage_score} />
          <InfoRow label="Trust Index" value={checklist?.trust_index} />
          <InfoRow
            label="Description"
            value={entity?.description || entity?.service_scope || entity?.methodology}
          />
        </div>

        <div className="checklist-panel">
          <h3>Reviewer Comments</h3>
          <div className="checklist-field">
            <label>Review Comments</label>
            <textarea
              rows="10"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="checklist-pillar-summary-wrap">
        <h4>Official Backend Pillar Scores</h4>
        <table className="checklist-table">
          <thead>
            <tr>
              <th>Pillar Code</th>
              <th>Pillar Name</th>
              <th>Awarded Score</th>
              <th>Max Score</th>
              <th>Percentage</th>
              <th>Minimum Rule Met</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {pillarScores.map((pillar) => (
              <tr key={`${pillar.pillar_code}-${pillar.pillar_name}`}>
                <td>{pillar.pillar_code}</td>
                <td>{pillar.pillar_name}</td>
                <td>{pillar.awarded_score}</td>
                <td>{pillar.max_score}</td>
                <td>{pillar.percentage_score}%</td>
                <td>{pillar.meets_minimum_rule ? "Yes" : "No"}</td>
                <td>{pillar.risk_level || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="checklist-table-wrap">
        <table className="checklist-table">
          <thead>
            <tr>
              <th>Pillar</th>
              <th>Criterion</th>
              <th>Status</th>
              <th>Max</th>
              <th>Awarded</th>
              <th>Observation</th>
              <th>Risk</th>
              <th>Recommendation</th>
              <th>Evidence Ref</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.pillar_code}</td>
                <td>{item.item_name}</td>
                <td>{item.status}</td>
                <td>{item.max_score}</td>
                <td>{item.status === "not_applicable" ? "N/A" : item.awarded_score}</td>
                <td>{item.observation || "-"}</td>
                <td>{item.risk_note || "-"}</td>
                <td>{item.recommendation || "-"}</td>
                <td>{item.evidence_ref || "-"}</td>
                <td>{item.comments || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="checklist-review-actions">
        <button
          className="checklist-secondary-btn"
          onClick={() => handleReviewAction("REVIEWED")}
          disabled={working}
        >
          {working ? "Processing..." : "Mark as Reviewed"}
        </button>

        <button
          className="checklist-warning-btn"
          onClick={() => handleReviewAction("REWORK_REQUIRED")}
          disabled={working}
        >
          {working ? "Processing..." : "Return to Auditor"}
        </button>

        <button
          className="checklist-submit-btn"
          onClick={() => handleReviewAction("FINALIZED")}
          disabled={working}
        >
          {working ? "Processing..." : "Finalize Review"}
        </button>
      </div>
    </div>
  );
}