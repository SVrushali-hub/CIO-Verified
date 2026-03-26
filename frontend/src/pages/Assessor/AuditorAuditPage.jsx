import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../styles/assessorAuditPage.css";

const API_BASE = "http://localhost:5000/api";

function InfoRow({ label, value }) {
  return (
    <div className="audit-info-row">
      <span className="audit-info-label">{label}</span>
      <span className="audit-info-value">{value || "N/A"}</span>
    </div>
  );
}

function EntityCard({ title, name, category, description, extra }) {
  return (
    <div className="audit-entity-card">
      <h4>{title}</h4>
      <InfoRow label="Name" value={name} />
      <InfoRow label="Category" value={category} />
      <InfoRow label="Description" value={description} />
      {extra}
    </div>
  );
}

function ChecklistCard({ checklist, onOpen }) {
  return (
    <div className="audit-checklist-card">
      <div className="audit-checklist-card-top">
        <div>
          <h4>{checklist.entity_name}</h4>
          <p className="audit-muted">
            {String(checklist.entity_type || "").toUpperCase()} · {checklist.category || "N/A"}
          </p>
        </div>

        <span className={`audit-status audit-status-${String(checklist.status || "").toLowerCase()}`}>
          {checklist.status || "N/A"}
        </span>
      </div>

      <div className="audit-checklist-meta">
        <InfoRow label="Checklist Type" value={checklist.checklist_type} />
        <InfoRow label="Subcategory" value={checklist.subcategory} />
        <InfoRow label="Framework Version" value={checklist.framework_version} />
      </div>

      <button className="audit-primary-btn" onClick={() => onOpen(checklist.id)}>
        Open Checklist
      </button>
    </div>
  );
}

export default function AuditorAuditPage() {
  const { applicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [auditData, setAuditData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchAuditData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/auditor/application/${applicationId}/start-audit`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load audit workspace");
        }

        if (isMounted) {
          setAuditData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("AuditorAuditPage fetch error:", err);
          setError(err.message || "Server error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!location.state) {
      fetchAuditData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [applicationId, location.state, token]);

  const application = auditData?.application || null;
  const company = auditData?.company || null;
  const products = useMemo(() => auditData?.products || [], [auditData]);
  const solutions = useMemo(() => auditData?.solutions || [], [auditData]);
  const checklists = useMemo(() => auditData?.checklists || [], [auditData]);

  const handleOpenChecklist = (checklistId) => {
    navigate(`/assessor/checklist/${checklistId}`);
  };

  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-loading-card">Loading audit workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-page">
        <div className="audit-error-card">
          <h3>Unable to load audit workspace</h3>
          <p>{error}</p>
          <button className="audit-primary-btn" onClick={() => navigate("/assessor/audit")}>
            Back to Audit Queue
          </button>
        </div>
      </div>
    );
  }

  if (!auditData || !application) {
    return (
      <div className="audit-page">
        <div className="audit-error-card">
          <h3>No audit data found</h3>
          <button className="audit-primary-btn" onClick={() => navigate("/assessor/audit")}>
            Back to Audit Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h2>Audit Workspace</h2>
          <p className="audit-muted">Application #{application.id}</p>
        </div>

        <button className="audit-secondary-btn" onClick={() => navigate("/assessor/audit")}>
          Back
        </button>
      </div>

      <section className="audit-section">
        <div className="audit-section-header">
          <h3>Application Overview</h3>
        </div>

        <div className="audit-overview-grid">
          <div className="audit-panel">
            <h4>Application Details</h4>
            <InfoRow label="Application ID" value={application.id} />
            <InfoRow label="Legal Name" value={application.legal_name} />
            <InfoRow label="Brand Name" value={application.brand_name} />
            <InfoRow label="Website" value={application.website} />
            <InfoRow label="HQ Location" value={application.hq_location} />
            <InfoRow label="Contact Name" value={application.contact_name} />
            <InfoRow label="Contact Email" value={application.contact_email} />
            <InfoRow label="Service Scope" value={application.service_scope} />
            <InfoRow label="Status" value={application.status} />
          </div>

          <div className="audit-panel">
            <h4>Company Details</h4>
            <InfoRow label="Company Name" value={company?.company_name} />
            <InfoRow label="Registration Number" value={company?.registration_number} />
            <InfoRow label="Industry" value={company?.industry} />
            <InfoRow label="Contact Person" value={company?.contact_person} />
            <InfoRow label="Designation" value={company?.designation} />
            <InfoRow label="Email" value={company?.email} />
            <InfoRow label="Phone" value={company?.phone} />
            <InfoRow label="Status" value={company?.status} />
          </div>
        </div>
      </section>

      <section className="audit-section">
        <div className="audit-section-header">
          <h3>Products</h3>
        </div>

        {!products.length ? (
          <div className="audit-empty-card">No products found for this application.</div>
        ) : (
          <div className="audit-card-grid">
            {products.map((product) => (
              <EntityCard
                key={product.id}
                title="Product"
                name={product.product_name}
                category={product.category}
                description={product.description}
                extra={
                  <>
                    <InfoRow label="Industry Served" value={product.industry_served} />
                    <InfoRow label="Deployment Type" value={product.deployment_type} />
                    <InfoRow label="Version" value={product.version} />
                    <InfoRow label="Pricing Model" value={product.pricing_model} />
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="audit-section">
        <div className="audit-section-header">
          <h3>Solutions</h3>
        </div>

        {!solutions.length ? (
          <div className="audit-empty-card">No solutions found for this application.</div>
        ) : (
          <div className="audit-card-grid">
            {solutions.map((solution) => (
              <EntityCard
                key={solution.id}
                title="Solution / Service"
                name={solution.solution_name}
                category={solution.category}
                description={solution.description}
                extra={
                  <>
                    <InfoRow label="Industry Served" value={solution.industry_served} />
                    <InfoRow label="Methodology" value={solution.methodology} />
                    <InfoRow label="Projects Completed" value={solution.projects_completed} />
                    <InfoRow label="Ongoing Projects" value={solution.ongoing_projects} />
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="audit-section">
        <div className="audit-section-header">
          <h3>Generated Checklists</h3>
        </div>

        {!checklists.length ? (
          <div className="audit-empty-card">No checklists generated yet.</div>
        ) : (
          <div className="audit-card-grid">
            {checklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onOpen={handleOpenChecklist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}