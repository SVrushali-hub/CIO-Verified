import {useEffect, useState } from "react";
import "../../styles/checklist.css";
import { useSearchParams } from "react-router-dom";
import API from "../../services/api";

function AssessorProfile() {
  const [type, setType] = useState("");
  const [showOtherSpec, setShowOtherSpec] = useState(false);
  const [errors, setErrors] = useState({});
const [searchParams] = useSearchParams();
const token = searchParams.get("token");
const [valid, setValid] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    type: "",

    email: "",
    experience_years: "",
    specialization: "",
    other_specialization: "",
    certifications: "",
    linkedin_profile: "",
    resume: null,

    company_name: "",
    gstin: "",
    years_in_operation: "",
    company_profile: null,

    address: "",
  });
useEffect(() => {
  const validateToken = async () => {
    try {
      const res = await API.get(`/assessor/validate-token?token=${token}`);

      if (res.data.valid) {
        setValid(true);

        // auto-fill email
        setFormData(prev => ({
          ...prev,
          email: res.data.email
        }));
      }

    } catch (err) {
      alert("Invalid or expired link");
    }
  };

  if (token) validateToken();
}, [token]);
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.full_name) newErrors.full_name = "Full name required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit phone";

    if (!formData.type) newErrors.type = "Select type";

    if (!formData.email) newErrors.email = "Email required";

    if (!formData.experience_years)
      newErrors.experience_years = "Experience required";

    if (!formData.specialization)
      newErrors.specialization = "Select specialization";

    if (formData.specialization === "Other" && !formData.other_specialization)
      newErrors.other_specialization = "Specify specialization";

    if (!formData.address) newErrors.address = "Address required";

    if (formData.type === "company") {
      if (!formData.company_name)
        newErrors.company_name = "Company name required";

      if (!formData.gstin) newErrors.gstin = "GSTIN required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    form.append("token", token);

    await API.post("/assessor/submit-profile", form);

    alert("Profile Submitted Successfully ✅");

  } catch (err) {
    console.error(err);
    alert("Submission failed ❌");
  }
};
if (!valid) {
  return <h2>Invalid or expired invitation link ❌</h2>;
}
  return (
    
    <div className="profile-container">
      <h1>Create Assessor Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* BASIC */}
        <input
          name="full_name"
          placeholder="Full Name *"
          onChange={handleChange}
        />
        {errors.full_name && <p className="error">{errors.full_name}</p>}

        <input
          name="phone"
          placeholder="Phone Number *"
          onChange={handleChange}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        {/* TYPE */}
       {/* TYPE */}
<label className="label">Select Type *</label>

<div className="radio-group">
  <label className="radio-item">
    <input
      type="radio"
      name="type"
      value="individual"
      checked={type === "individual"}
      onChange={(e) => {
        setType(e.target.value);
        setFormData({ ...formData, type: e.target.value });
      }}
    />
    <span>Individual</span>
  </label>

  <label className="radio-item">
    <input
      type="radio"
      name="type"
      value="company"
      checked={type === "company"}
      onChange={(e) => {
        setType(e.target.value);
        setFormData({ ...formData, type: e.target.value });
      }}
    />
    <span>Company</span>
  </label>
</div>

{errors.type && <p className="error">{errors.type}</p>}

        {/* SHOW ONLY AFTER TYPE */}
        <>
          <>
            <input
              name="email"
              placeholder="Email *"
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <input
              type="number"
              name="experience_years"
              placeholder="Experience (Years) *"
              onChange={handleChange}
            />
            {errors.experience_years && (
              <p className="error">{errors.experience_years}</p>
            )}

            {/* SPECIALIZATION */}
            <label className="label">Specialization *</label>

            <select
              name="specialization"
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, specialization: value });
                setShowOtherSpec(value === "Other");
              }}
            >
              <option value="">Select Specialization</option>
              <option value="Security">Security</option>
              <option value="Cloud">Cloud</option>
              <option value="ERP">ERP</option>
              <option value="AI">AI</option>
              <option value="Other">Other</option>
            </select>

            {errors.specialization && (
              <p className="error">{errors.specialization}</p>
            )}

            {showOtherSpec && (
              <input
                name="other_specialization"
                placeholder="Specify Other *"
                onChange={handleChange}
              />
            )}

            {errors.other_specialization && (
              <p className="error">{errors.other_specialization}</p>
            )}

            {/* OPTIONAL */}
            <textarea
              name="certifications"
              placeholder="Certifications (Optional)"
              onChange={handleChange}
            />

            <input
              name="linkedin_profile"
              placeholder="LinkedIn Profile"
              onChange={handleChange}
            />

            <input type="file" name="resume" onChange={handleChange} />

            {/* COMPANY */}
            {type === "company" && (
              <>
                <h2>Company Details</h2>

                <input
                  name="company_name"
                  placeholder="Company Name *"
                  onChange={handleChange}
                />
                {errors.company_name && (
                  <p className="error">{errors.company_name}</p>
                )}

                <input
                  name="gstin"
                  placeholder="GSTIN *"
                  onChange={handleChange}
                />
                {errors.gstin && (
                  <p className="error">{errors.gstin}</p>
                )}

                <input
                  name="years_in_operation"
                  placeholder="Years in Operation"
                  onChange={handleChange}
                />

                <input
                  type="file"
                  name="company_profile"
                  onChange={handleChange}
                />
              </>
            )}

            {/* ADDRESS */}
            <textarea
              name="address"
              placeholder="Full Address *"
              onChange={handleChange}
            />
            {errors.address && (
              <p className="error">{errors.address}</p>
            )}

            <button type="submit">Submit</button>
          </>
        </>{/* END SHOW ONLY AFTER TYPE */}
      </form>
    </div>
  );
}

export default AssessorProfile;