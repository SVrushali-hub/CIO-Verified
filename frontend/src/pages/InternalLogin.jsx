import { useNavigate } from "react-router-dom";
import { useState } from "react";
import InternalLoginForm from "../components/InternalLoginForm";
import { internalLogin } from "../services/authService";

export default function InternalLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (form) => {
    try {
      setLoading(true);

      const data = await internalLogin({
        ...form,
        isInternal: true,
      });

      // ✅ store token
      localStorage.setItem("token", data.token);

      // ✅ store user + profile flag
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          isProfileComplete: data.isProfileComplete,
        })
      );

      // 🔥 FORCE PROFILE COMPLETION
      if (!data.isProfileComplete) {
        navigate("/internal/profile-setup");
        return;
      }

      // 🔀 role-based redirect
      switch (data.user.role) {
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
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternalLoginForm onSubmit={handleLogin} loading={loading} />
  );
}