import { useEffect, useMemo, useState } from "react";
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

function ItemCard({ item, onFieldChange }) {
  const maxScore = Number(item.max_score || 0);

  return (
    <div className="checklist-item-card">
      <div className="checklist-item-head">
        <div>
          <h4>{item.item_name}</h4>
          <p className="checklist-item-code">
            {item.pillar_code} · {item.item_code}
          </p>
        </div>

        <div className="checklist-item-badges">
          <span className="checklist-badge">Max: {maxScore}</span>
          {item.critical_item ? (
  <p className="checklist-critical-note">
    Critical item: full marks required to pass.
  </p>
) : null}
        </div>
      </div>

      <p className="checklist-item-description">
        {item.description || "No description available."}
      </p>

      <div className="checklist-form-grid">
        <div className="checklist-field">
          <label>Awarded Score</label>
          <input
            type="number"
            min="0"
            max={maxScore}
            value={item.awarded_score ?? 0}
            onChange={(e) => {
              const value = e.target.value;
              const numeric = value === "" ? "" : Number(value);

              if (numeric === "") {
                onFieldChange(item.id, "awarded_score", "");
                return;
              }

              if (numeric < 0) return;

              onFieldChange(
                item.id,
                "awarded_score",
                numeric > maxScore ? maxScore : numeric
              );
            }}
            disabled={item.status === "not_applicable"}
          />
        </div>

        <div className="checklist-field">
          <label>Status</label>
          <select
            value={item.status || "pending"}
            onChange={(e) => onFieldChange(item.id, "status", e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>

        <div className="checklist-field checklist-field-checkbox">
          <label>
            <input
              type="checkbox"
              checked={Boolean(item.critical_item)}
              onChange={(e) =>
                onFieldChange(item.id, "critical_item", e.target.checked)
              }
            />
            Critical Item
          </label>
        </div>
      </div>

      <div className="checklist-form-stack">
        <div className="checklist-field">
          <label>Observation</label>
          <textarea
            rows="3"
            value={item.observation || ""}
            onChange={(e) => onFieldChange(item.id, "observation", e.target.value)}
          />
        </div>

        <div className="checklist-field">
          <label>Risk Note</label>
          <textarea
            rows="3"
            value={item.risk_note || ""}
            onChange={(e) => onFieldChange(item.id, "risk_note", e.target.value)}
          />
        </div>

        <div className="checklist-field">
          <label>Recommendation</label>
          <textarea
            rows="3"
            value={item.recommendation || ""}
            onChange={(e) =>
              onFieldChange(item.id, "recommendation", e.target.value)
            }
          />
        </div>

        <div className="checklist-field">
          <label>Evidence Ref / Link</label>
          <textarea
            rows="2"
            value={item.evidence_ref || ""}
            onChange={(e) => onFieldChange(item.id, "evidence_ref", e.target.value)}
          />
        </div>

        <div className="checklist-field">
          <label>Comments</label>
          <textarea
            rows="2"
            value={item.comments || ""}
            onChange={(e) => onFieldChange(item.id, "comments", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChecklistDetail() {
  const { checklistId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [items, setItems] = useState([]);
  const [assessmentDate, setAssessmentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingPreview, setCalculatingPreview] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [officialPreview, setOfficialPreview] = useState(null);
  const [officialPillarScores, setOfficialPillarScores] = useState([]);
  const today = new Date().toISOString().split("T")[0];


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
          throw new Error(data.message || "Failed to load checklist workspace");
        }

        if (!mounted) return;

        setWorkspace(data);
        setItems(
          (data.items || []).map((item) => ({
            ...item,
            awarded_score: item.awarded_score ?? 0,
            status: item.status || "pending",
            observation: item.observation || "",
            risk_note: item.risk_note || "",
            recommendation: item.recommendation || "",
            evidence_ref: item.evidence_ref || "",
            comments: item.comments || "",
          }))
        );
        setAssessmentDate(
          data.checklist?.assessment_date
            ? String(data.checklist.assessment_date).slice(0, 10)
            : ""
        );
        setNotes(data.checklist?.notes || "");
      } catch (err) {
        if (!mounted) return;
        console.error("Checklist workspace error:", err);
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

  const groupedPillars = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      const key = `${item.pillar_code}__${item.pillar_name}`;

      if (!map.has(key)) {
        map.set(key, {
          pillar_code: item.pillar_code,
          pillar_name: item.pillar_name,
          items: [],
        });
      }

      map.get(key).items.push(item);
    }

    return Array.from(map.values());
  }, [items]);

  const totalSteps = groupedPillars.length + 1;
  const isReviewStep = currentStep === groupedPillars.length;
  const currentPillar = !isReviewStep ? groupedPillars[currentStep] : null;

  const previewScores = useMemo(() => {
    const applicableItems = items.filter((item) => item.status !== "not_applicable");

    const totalScore = applicableItems.reduce(
      (sum, item) => sum + Number(item.awarded_score || 0),
      0
    );

    const maxScore = applicableItems.reduce(
      (sum, item) => sum + Number(item.max_score || 0),
      0
    );

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const trustIndex = percentage / 10;

    let status = "Assessment In Progress";
    if (percentage >= 85) status = "Likely Gold";
    else if (percentage >= 75) status = "Likely Certified";
    else if (percentage >= 65) status = "Likely Withheld";
    else status = "Likely Not Certified";

    return {
      totalScore,
      maxScore,
      percentage: Number(percentage.toFixed(2)),
      trustIndex: Number(trustIndex.toFixed(2)),
      status,
    };
  }, [items]);

  const pillarSummaries = useMemo(() => {
    return groupedPillars.map((pillar) => {
      const applicableItems = pillar.items.filter(
        (item) => item.status !== "not_applicable"
      );

      const awarded = applicableItems.reduce(
        (sum, item) => sum + Number(item.awarded_score || 0),
        0
      );

      const max = applicableItems.reduce(
        (sum, item) => sum + Number(item.max_score || 0),
        0
      );

      const percentage = max > 0 ? (awarded / max) * 100 : 0;

      return {
        pillar_code: pillar.pillar_code,
        pillar_name: pillar.pillar_name,
        awarded,
        max,
        percentage: Number(percentage.toFixed(2)),
      };
    });
  }, [groupedPillars]);

  const buildSavePayload = () => ({
    assessment_date: assessmentDate || null,
    notes,
    responses: items.map((item) => ({
      id: item.id,
      awarded_score:
        item.status === "not_applicable" ? 0 : Number(item.awarded_score || 0),
      critical_item: Boolean(item.critical_item),
      status: item.status || "pending",
      observation: item.observation || "",
      risk_note: item.risk_note || "",
      recommendation: item.recommendation || "",
      evidence_ref: item.evidence_ref || "",
      comments: item.comments || "",
    })),
  });

  const handleFieldChange = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const updated = { ...item, [field]: value };

        if (field === "status" && value === "not_applicable") {
          updated.awarded_score = 0;
        }

        return updated;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/checklists/${checklistId}/responses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(buildSavePayload()),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save checklist");
      }

      alert("Checklist saved successfully");
    } catch (err) {
      console.error("Save checklist error:", err);
      alert(err.message || "Failed to save checklist");
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateOfficialPreview = async () => {
    try {
      setCalculatingPreview(true);

      const saveRes = await fetch(`${API_BASE}/checklists/${checklistId}/responses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(buildSavePayload()),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData.message || "Failed to save before calculating preview");
      }

      const previewRes = await fetch(
        `${API_BASE}/checklists/${checklistId}/calculate-preview`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const previewData = await previewRes.json();

      if (!previewRes.ok) {
        throw new Error(previewData.message || "Failed to calculate official preview");
      }

      setOfficialPreview(previewData.scoreSummary || null);
      setOfficialPillarScores(previewData.pillarScores || []);
      alert("Official backend score calculated successfully");
    } catch (err) {
      console.error("Official preview error:", err);
      alert(err.message || "Failed to calculate official preview");
    } finally {
      setCalculatingPreview(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!officialPreview) {
      alert("Please calculate the official backend score before submitting for review.");
      return;
    }

    try {
      setSubmitting(true);

      const saveRes = await fetch(`${API_BASE}/checklists/${checklistId}/responses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(buildSavePayload()),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData.message || "Failed to save before submission");
      }

      const submitRes = await fetch(`${API_BASE}/checklists/${checklistId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        throw new Error(submitData.message || "Failed to submit for review");
      }

      alert("Checklist submitted for review successfully");
      navigate(-1);
    } catch (err) {
      console.error("Submit checklist error:", err);
      alert(err.message || "Failed to submit checklist");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checklist-page">
        <div className="checklist-loading">Loading checklist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checklist-page">
        <div className="checklist-error-card">
          <h3>Unable to load checklist</h3>
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

  return (
    <div className="checklist-page">
      <div className="checklist-sticky-top">
        <div className="checklist-topbar">
          <div>
            <h2>{checklist?.entity_name || "Checklist"}</h2>
            <p className="checklist-muted">
              {String(checklist?.entity_type || "").toUpperCase()} ·{" "}
              {checklist?.category || "N/A"} · Step {currentStep + 1} of {totalSteps}
            </p>
          </div>

          <div className="checklist-topbar-actions">
            <button className="checklist-secondary-btn" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="checklist-primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
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
            <h3>Entity Under Evaluation</h3>
            <InfoRow label="Checklist ID" value={checklist?.id} />
            <InfoRow label="Entity Type" value={checklist?.entity_type} />
            <InfoRow label="Entity Name" value={checklist?.entity_name} />
            <InfoRow label="Category" value={checklist?.category} />
            <InfoRow label="Subcategory" value={checklist?.subcategory} />
            <InfoRow label="Checklist Status" value={checklist?.status} />
            <InfoRow
              label="Description"
              value={entity?.description || entity?.service_scope || entity?.methodology}
            />
          </div>

          <div className="checklist-panel">
            <h3>Assessment Meta</h3>
            <div className="checklist-field">
              <label>Assessment Date</label>
              <input
                type="date"
                value={assessmentDate}
                min={today}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
            </div>

            {["REWORK_REQUIRED", "REVIEWED"].includes(checklist?.status) &&
 checklist?.review_comments ? (
  <div className="checklist-review-feedback-panel">
    <h3>Reviewer Feedback</h3>
    <p className="checklist-review-feedback-status">
      Current Status: <strong>{checklist.status}</strong>
    </p>
    <div className="checklist-review-feedback-box">
      {checklist.review_comments}
    </div>
  </div>
) : null}

            <div className="checklist-field">
              <label>Notes</label>
              <textarea
                rows="5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {!isReviewStep ? (
        <div className="checklist-main">
          <div className="checklist-section-header">
            <div>
              <h3>{currentPillar?.pillar_name}</h3>
              <p className="checklist-muted">{currentPillar?.pillar_code}</p>
            </div>
          </div>

          <div className="checklist-items-stack">
            {currentPillar?.items.map((item) => (
              <ItemCard key={item.id} item={item} onFieldChange={handleFieldChange} />
            ))}
          </div>
        </div>
      ) : (
        <div className="checklist-main">
          <div className="checklist-section-header">
            <div>
              <h3>Final Review</h3>
              <p className="checklist-muted">
                Review all captured checklist data before submission
              </p>
            </div>
          </div>

          <div className="checklist-summary-cards">
            <div className="checklist-summary-card">
              <span>Total Score</span>
              <strong>{previewScores.totalScore}</strong>
            </div>
            <div className="checklist-summary-card">
              <span>Max Score</span>
              <strong>{previewScores.maxScore}</strong>
            </div>
            <div className="checklist-summary-card">
              <span>Percentage</span>
              <strong>{previewScores.percentage}%</strong>
            </div>
            <div className="checklist-summary-card">
              <span>Trust Index</span>
              <strong>{previewScores.trustIndex}</strong>
            </div>
            <div className="checklist-summary-card">
              <span>Preview Status</span>
              <strong>{previewScores.status}</strong>
            </div>
          </div>

          <div className="checklist-pillar-summary-wrap">
            <h4>Pillar-wise Preview Score Summary</h4>

            <table className="checklist-table">
              <thead>
                <tr>
                  <th>Pillar Code</th>
                  <th>Pillar Name</th>
                  <th>Awarded Score</th>
                  <th>Max Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {pillarSummaries.map((pillar) => (
                  <tr key={`${pillar.pillar_code}-${pillar.pillar_name}`}>
                    <td>{pillar.pillar_code}</td>
                    <td>{pillar.pillar_name}</td>
                    <td>{pillar.awarded}</td>
                    <td>{pillar.max}</td>
                    <td>{pillar.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="checklist-official-preview-wrap">
            <div className="checklist-official-preview-header">
              <h4>Official Backend Score Preview</h4>
              <button
                className="checklist-primary-btn"
                onClick={handleCalculateOfficialPreview}
                disabled={calculatingPreview}
              >
                {calculatingPreview ? "Calculating..." : "Calculate Official Score"}
              </button>
            </div>

            {!officialPreview ? (
              <p className="checklist-muted">
                Calculate the official backend score before submitting for review.
              </p>
            ) : (
              <>
                <div className="checklist-summary-cards">
                  <div className="checklist-summary-card">
                    <span>Total Score</span>
                    <strong>{officialPreview.totalScore}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Max Score</span>
                    <strong>{officialPreview.maxScore}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Percentage</span>
                    <strong>{officialPreview.percentageScore}%</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Trust Index</span>
                    <strong>{officialPreview.trustIndex}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Certification Status</span>
                    <strong>{officialPreview.certification_status}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Certification Band</span>
                    <strong>{officialPreview.certification_band}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Critical Failure</span>
                    <strong>{officialPreview.criticalFailure ? "Yes" : "No"}</strong>
                  </div>
                  <div className="checklist-summary-card">
                    <span>Pillar Rule Failure</span>
                    <strong>{officialPreview.pillarRuleFailure ? "Yes" : "No"}</strong>
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
                      {officialPillarScores.map((pillar) => (
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
              </>
            )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="checklist-review-actions">
            <button
              className="checklist-secondary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              className="checklist-submit-btn"
              onClick={handleSubmitForReview}
              disabled={submitting || !officialPreview}
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      )}

      <div className="checklist-navigation">
        <button
          className="checklist-secondary-btn"
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
        >
          Back
        </button>

        {!isReviewStep ? (
          <button
            className="checklist-primary-btn"
            onClick={() =>
              setCurrentStep((prev) => Math.min(prev + 1, groupedPillars.length))
            }
          >
            {currentStep === groupedPillars.length - 1 ? "Complete" : "Next"}
          </button>
        ) : (
          <button
            className="checklist-primary-btn"
            onClick={() => setCurrentStep(groupedPillars.length - 1)}
          >
            Edit Last Section
          </button>
        )}
      </div>
    </div>
  );
}