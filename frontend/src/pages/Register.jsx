import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    industry: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  /* Generic change handler */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* Text-only fields */
  const handleTextOnly = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFormData({ ...formData, [e.target.name]: value });
  };

  /* Number-only fields */
  const handleNumberOnly = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, [e.target.name]: value });
  };

  const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,16}$/;

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#^()_\-+=]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    if (strength === 5) return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cin = formData.registrationNumber.trim();

    if (!cinRegex.test(cin)) {
      alert("Invalid CIN format.\nExample: U12345MH2020PLC012345");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      alert(
        "Password must be 8-16 characters long and include:\n" +
          "- At least 1 uppercase letter\n" +
          "- At least 1 lowercase letter\n" +
          "- At least 1 number\n" +
          "- At least 1 special character"
      );
      return;
    }

    if (
      formData.password
        .toLowerCase()
        .includes(formData.email.toLowerCase())
    ) {
      alert("Password should not contain your email address.");
      return;
    }

    try {
  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...formData, registrationNumber: cin })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Registration failed");
    return;
  }

  alert("OTP sent to your registered email");

  navigate("/verify-otp", {
    state: { email: formData.email }
  });

} catch (error) {
  console.error("Registration error:", error);
  alert("Server error. Please try again later.");
}
  };
  return (
    <div className="auth-container">
      <div className="auth-inner">
        <h2>Company Certification Application</h2>

        <form onSubmit={handleSubmit}>
          <label>Company Name</label>
          <input
            name="companyName"
            placeholder="Enter company legal name"
            value={formData.companyName}
            onChange={handleChange}
            required
          />

          <label className="cin-label">
            Registration Number (CIN)
            <span
              className="info-icon"
              title={`CIN Format (21 Characters):

1st: L or U (Listed/Unlisted) 
Next 5: Industry Code
Next 2: State Code (MH, DL, etc.)
Next 4: Year of Incorporation
Next 3: Company Type (PLC/PTC)
Last 6: ROC Registration Number

Example: U12345MH2020PLC012345`}
            >
              ℹ️
            </span>
          </label>

          <input
            name="registrationNumber"
            placeholder="Company registration / CIN number"
            value={formData.registrationNumber}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setFormData({ ...formData, registrationNumber: value });
            }}
            maxLength={21}
            required
          />

          <label>Industry / Domain</label>
          <input
            name="industry"
            placeholder="e.g. Manufacturing, IT Services"
            value={formData.industry}
            onChange={handleTextOnly}
          />

          <label>Contact Person</label>
          <input
            name="contactPerson"
            placeholder="Authorized representative"
            value={formData.contactPerson}
            onChange={handleTextOnly}
            required
          />

          <label>Designation</label>
          <input
            name="designation"
            placeholder="e.g. Director, Compliance Officer"
            value={formData.designation}
            onChange={handleTextOnly}
          />

          <label>Official Email</label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            name="phone"
            placeholder="Official contact number"
            value={formData.phone}
            onChange={handleNumberOnly}
            maxLength={10}
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                setPasswordStrength(
                  checkPasswordStrength(e.target.value)
                );
              }}
              minLength={8}
              maxLength={16}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {formData.password && (
            <div className={`strength ${passwordStrength?.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>
          )}

          <label>Confirm Password</label>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit">Submit Application</button>
        </form>

        <div className="auth-helper">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;