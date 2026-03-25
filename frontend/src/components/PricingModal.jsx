import { useState } from "react";
import API from "../services/api";

export default function PricingModal({ application, onClose, onSuccess }) {
  const [price, setPrice] = useState(application.total_amount || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await API.post("/applications/set-pricing", {
        application_id: application.id,
        total_amount: price,
      });

      alert("Pricing set successfully");

      onSuccess(); // refresh data
      onClose();   // close modal
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Set Pricing</h2>

        <label>Total Amount</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}