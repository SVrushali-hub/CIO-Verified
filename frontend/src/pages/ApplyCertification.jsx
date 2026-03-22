import { useState } from "react";
import API from "../services/api";
import "../styles/applyCertification.css";

function ApplyCertification() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    legal_name: "",
    brand_name: "",
    website: "",
    hq_location: "",
    contact_name: "",
    contact_email: "",
    service_scope: "",
    customer_count: "",
    employee_count: "",
    years_in_business: "",
    items: [{ name: "", package_type: "VERIFICATION" }],
    evidences: []
  });

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Items
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", package_type: "VERIFICATION" }]
    });
  };

  const removeItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // File upload
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      evidences: [...e.target.files]
    });
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "items" && key !== "evidences") {
          form.append(key, formData[key]);
        }
      });

      form.append("items", JSON.stringify(formData.items));

      formData.evidences.forEach((file) => {
        form.append("files", file);
      });

      await API.post("/applications", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Application submitted successfully");

    } catch (err) {
      alert("Submission failed");
    }
  };

  return (
    <div className="apply-wrapper">
      <div className="apply-card">

        <h2>Apply for CIO Certification</h2>
        <p className="step-text">Step {step} of 4</p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h3 className="section-title">Company Profile</h3>

            <input name="legal_name" placeholder="Legal Name" onChange={handleChange} />
            <input name="brand_name" placeholder="Brand Name" onChange={handleChange} />
            <input name="website" placeholder="Website" onChange={handleChange} />
            <input name="hq_location" placeholder="Head Office Location" onChange={handleChange} />
            <input name="contact_name" placeholder="Contact Name" onChange={handleChange} />
            <input name="contact_email" placeholder="Contact Email" onChange={handleChange} />
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h3 className="section-title">Business Details</h3>

            <input name="service_scope" placeholder="Service Scope" onChange={handleChange} />
            <input type="number" name="customer_count" placeholder="Customer Count" onChange={handleChange} />
            <input type="number" name="employee_count" placeholder="Employee Count" onChange={handleChange} />
            <input type="number" name="years_in_business" placeholder="Years in Business" onChange={handleChange} />
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h3 className="section-title">Items & Packages</h3>

            {formData.items.map((item, index) => (
              <div key={index}>
                <input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                />

                <select
                  value={item.package_type}
                  onChange={(e) =>
                    handleItemChange(index, "package_type", e.target.value)
                  }
                >
                  <option value="VERIFICATION">Verification</option>
                  <option value="VERIFICATION_CERTIFICATION">
                    Verification + Certification
                  </option>
                  <option value="FULL_PACKAGE">
                    Full Package
                  </option>
                </select>

                {index > 0 && (
                  <button onClick={() => removeItem(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button onClick={addItem}>+ Add Item</button>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h3 className="section-title">Upload Evidence</h3>

<label className="file-upload">
  <input type="file" multiple onChange={handleFileChange} />
  <div>Click to upload or drag & drop files</div>
</label>

<p className="file-text">
  {formData.evidences.length} file(s) selected
</p>
          </>
        )}

        {/* BUTTONS */}
        <div className="button-group">
          {step > 1 && (
            <button className="btn btn-back" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}

          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit Application
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ApplyCertification;