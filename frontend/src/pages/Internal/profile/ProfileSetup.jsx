import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/profilesetup.css";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);

  /* OTP STATES */
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  /* 🔥 TIMER */
  const [timer, setTimer] = useState(0);

  /* INPUT */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    try {
      if (!form.email) return alert("Enter email first");

      await API.post("/profile/send-email-otp", {
        email: form.email,
      });

      setOtpSent(true);
      setTimer(30); // 🔥 start cooldown

      alert("OTP sent to your email");

    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    try {
      setVerifying(true);

      await API.post("/profile/verify-email-otp", {
        email: form.email,
        otp,
      });

      setVerified(true);
      setOtpSent(false);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          is_verified: true,
        })
      );

      alert("Email verified successfully");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verified) return alert("Please verify your email first");

    try {
      setLoading(true);

      // 🔒 DO NOT SEND EMAIL AGAIN
      const { email, ...rest } = form;

      await API.put("/profile", rest);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          isProfileComplete: true,
          is_verified: true,
        })
      );

      alert("Profile completed successfully");

      // redirect
      switch (user.role) {
        case "SUPERADMIN":
          navigate("/internal/superadmin");
          break;
        case "ADMIN":
          navigate("/internal/admin");
          break;
        case "OPERATIONS":
          navigate("/internal/operations");
          break;
        default:
          navigate("/internal-login");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Complete Your Profile</h2>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>

            <div className="email-row">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={verified}
                required
              />

              {!verified && (
                <button
                  id="verify-btn"
                  type="button"
                  onClick={sendOtp}
                  disabled={timer > 0}
                >
                  {timer > 0 ? `Wait ${timer}s` : "Verify"}
                </button>
              )}
            </div>

            {/* OTP */}
            {otpSent && !verified && (
              <div className="otp-section">
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Confirm OTP"}
                </button>

                {/* 🔥 RESEND */}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={timer > 0}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ff7a00",
                    cursor: timer > 0 ? "not-allowed" : "pointer",
                    fontSize: "13px",
                  }}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* VERIFIED */}
            {verified && (
              <span className="verified-badge">
                ✔ Verified
              </span>
            )}
          </div>

          {/* OTHER FIELDS */}
          <input name="phone" placeholder="Phone" onChange={handleChange} required />
          <input name="department" placeholder="Department" onChange={handleChange} required />
          <input name="designation" placeholder="Designation" onChange={handleChange} required />

          {/* SUBMIT */}
          <button type="submit" disabled={!verified || loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}