import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/drawer.css";

export default function ProfileDrawer({ onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);

  /* PASSWORD STATES */
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);

  /* 🔥 NEW: TIMER */
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  /* FETCH PROFILE */
  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setForm(res.data);
    } catch {
      alert("Failed to load profile");
    }
  };

  /* SAVE PROFILE */
  const saveProfile = async () => {
    try {
      setLoading(true);

      const { email, ...rest } = form;
      await API.put("/profile", rest);

      alert("Profile updated");
    } catch {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  /* SEND OTP */
  const sendOtp = async () => {
    try {
      setLoadingOtp(true);

      await API.post("/profile/send-otp");

      alert("OTP sent to your email");

      setStep(2);
      setTimer(30); // 🔥 START TIMER

    } catch {
      alert("Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  /* 🔥 TIMER EFFECT */
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  /* RESET PASSWORD */
  const resetPassword = async () => {
    try {
      await API.post("/profile/verify-otp", {
        otp,
        newPassword,
      });

      alert("Password updated");

      setStep(1);
      setOtp("");
      setNewPassword("");
      setTimer(0);

    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={onClose}>
        ← Back
      </button>

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-avatar">
          {form.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h3>{form.full_name || "Your Name"}</h3>
          <p>{form.email}</p>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="profile-card">
        <h4>Profile Information</h4>

        <div className="form-group">
          <label>Full Name</label>
          <input value={form.full_name || ""} disabled />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={form.email || ""} disabled />
          <p style={{ fontSize: "12px", color: "#28a745" }}>
            🔒 Verified & cannot be changed
          </p>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone || ""} disabled />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input value={form.department || ""} disabled />
        </div>

        <div className="form-group">
          <label>Designation</label>
          <input value={form.designation || ""} disabled />
        </div>

        <button onClick={saveProfile} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* PASSWORD CARD */}
      <div className="profile-card">
        <h4>Change Password</h4>

        {/* STEP 1 */}
        {step === 1 && (
          <button onClick={sendOtp} disabled={loadingOtp}>
            {loadingOtp ? "Sending..." : "Send OTP"}
          </button>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button onClick={resetPassword}>
              Reset Password
            </button>

            {/* 🔥 RESEND BUTTON */}
            <button
              type="button"
              onClick={sendOtp}
              disabled={timer > 0}
              style={{
                marginTop: "10px",
                background: "transparent",
                border: "none",
                color: "#ff7a00",
                cursor: timer > 0 ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}