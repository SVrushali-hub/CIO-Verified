import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/invoice.css";

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await API.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      alert("Failed to load invoice");
    }
  };

  if (!invoice) return <p>Loading invoice...</p>;

  return (
    <div className="invoice-container">

      <div className="invoice-card">

        <h2>Invoice</h2>

        <div className="invoice-section">
          <p><b>Company:</b> {invoice.legal_name}</p>
          <p><b>Email:</b> {invoice.contact_email}</p>
        </div>

        <div className="invoice-section">
          <p><b>Amount:</b> ₹{invoice.total_amount}</p>
          <p><b>Status:</b> {invoice.status}</p>
        </div>

        <button
          className="download-btn"
          onClick={() => window.print()}
        >
          Download PDF
        </button>

      </div>

    </div>
  );
}