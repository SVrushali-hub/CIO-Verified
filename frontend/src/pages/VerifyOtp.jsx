import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; // ✅ get from register

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp
      });

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch {
      alert("Invalid or expired OTP");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-inner">

        <h2>Verify OTP</h2>

        <p style={{ textAlign: "center", fontSize: "13px" }}>
          OTP sent to <b>{email}</b>
        </p>

        <input
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify}>Verify</button>

      </div>
    </div>
  );
}

export default VerifyOtp;