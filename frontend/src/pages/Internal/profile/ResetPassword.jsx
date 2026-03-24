import { useState } from "react";
import API from "../../../services/api";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const sendOtp = async () => {
    await API.post("/send-otp");
    setStep(2);
  };

  const resetPassword = async () => {
    await API.post("/verify-otp", {
      otp,
      newPassword: password,
    });

    alert("Password updated");
  };

  return (
    <div className="sa-container">
      <h2>Reset Password</h2>

      {step === 1 && (
        <button onClick={sendOtp}>Send OTP</button>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={resetPassword}>
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}