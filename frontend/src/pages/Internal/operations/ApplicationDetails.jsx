import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/applicationDetails.css";
import PricingModal from "../../../components/PricingModal";

function ApplicationDetails() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  useEffect(() => {
  const params = new URLSearchParams(location.search);

  if (params.get("pricing") === "true") {
    setShowPricing(true);
  }
}, [location.search]);
  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const res = await API.get(`/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GENERATE INVOICE
  ========================= */
  const handleGenerateInvoice = async () => {
    try {
      await API.post("/invoices/generate", {
        application_id: application.id,
      });

      alert("Invoice generated successfully ✅");
      fetchApplication();
    } catch (err) {
      alert(err.response?.data?.message || "Error generating invoice");
    }
  };

  /* =========================
     MARK AS PAID
  ========================= */
  const handleMarkPaid = async () => {
    try {
      await API.post(`/invoices/mark-paid/${application.id}`);
      alert("Marked as Paid ✅");
      fetchApplication();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!application) return <p>No data found</p>;

  return (
    <div className="operations-wrapper">
      <h2>Application Details</h2>

      {/* SUMMARY */}
      <div className="summary-cards">
        <div className="card highlight">
          <h4>Status</h4>
          <p className={`status-badge status-${application.status?.toLowerCase()}`}>
            {application.status}
          </p>
        </div>

        <div className="card highlight">
          <h4>Total Amount</h4>
          <p>₹{application.total_amount || 0}</p>
        </div>
      </div>

      {/* DETAILS */}
      <div className="details-grid">

        <div className="card">
          <h3>Company Info</h3>
          <p><b>Legal Name:</b> {application.legal_name}</p>
          <p><b>Website:</b> {application.website}</p>
        </div>

        <div className="card">
          <h3>Details</h3>
          <p><b>Contact:</b> {application.contact_name}</p>
          <p><b>Email:</b> {application.contact_email}</p>
          <p><b>Employees:</b> {application.employee_count}</p>
        </div>

        <div className="card">
          <h3>Headquarters</h3>
          <p><b>Location:</b> {application.hq_location}</p>
        </div>

      </div>

      {/* ================= ACTIONS ================= */}

      {/* 🔥 SET PRICING */}
      {application.status === "SUBMITTED" && (
        <div className="card highlight">
          <h3>Set Pricing</h3>
          <button onClick={() => setShowPricing(true)}>
            Set Pricing
          </button>
        </div>
      )}

      {/* 🔥 GENERATE INVOICE */}
      {application.status === "PRICING_DEFINED" && (
  <div className="card highlight">
    <h3>Invoice</h3>

    <button
      onClick={async () => {
        try {
          await API.post("/invoices/generate", {
            application_id: application.id
          });

          alert("Invoice generated ✅");
          window.location.reload();

        } catch {
          alert("Failed to generate invoice");
        }
      }}
    >
      Generate Invoice
    </button>
  </div>
)}

      {/* 🔥 MARK PAID */}
     {application.status === "INVOICE_ACCEPTED" &&
  (user.role === "ADMIN" || user.role === "SUPERADMIN") && (
    <div className="card highlight">
      <h3>Payment Pending</h3>

      <button onClick={handleMarkPaid}>
        Mark as Paid
      </button>
    </div>
)} 
      {application.status === "PAID" &&
  (user.role === "ADMIN" || user.role === "SUPERADMIN") && (
    <div className="card">
      <h3>Payment Verified</h3>

      <button
        onClick={() =>
          window.open(`/api/invoices/receipt/${application.id}`)
        }
      >
        Generate Receipt
      </button>

      <button
        onClick={async () => {
          await API.post(`/invoices/send-receipt/${application.id}`);
          alert("Email sent 📧");
        }}
      >
        Send to Email
      </button>
    </div>
)}

      {/* ================= MODAL ================= */}
      {showPricing && (
        <PricingModal
          application={application}
          onClose={() => setShowPricing(false)}
          onSuccess={fetchApplication}
        />
      )}
    </div>
  );
}

export default ApplicationDetails;