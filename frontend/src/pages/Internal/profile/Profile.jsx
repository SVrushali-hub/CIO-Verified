import { useEffect, useState } from "react";
import API from "../../../services/api";
import "../../../styles/superadmin.css";

export default function Profile() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    department: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
const [step, setStep] = useState(1);
const [otp, setOtp] = useState("");
const [password, setPassword] = useState("");
  // 🔥 Fetch profile
  const fetchProfile = async () => {
    const res = await API.get("/profile");
    setForm({
      full_name: res.data.full_name || "",
      phone: res.data.phone || "",
      department: res.data.department || "",
      email: res.data.email || "",
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);
const sendOtp = async () => {
  await API.post("/send-otp");
  alert("OTP sent (check console for now)");
  setStep(2);
};

const resetPassword = async () => {
  await API.post("/verify-otp", {
    otp,
    newPassword: password,
  });

  alert("Password updated successfully");
  setStep(1);
};
  // 🔥 Handle change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.put("/profile", form);
      alert("Profile updated");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-container">
      <h2>My Profile</h2>

      <form className="sa-form" onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
        />

        <button disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
      <hr />

<h3>Reset Password</h3>

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