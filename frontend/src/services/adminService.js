const BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// FETCH ADMINS
export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins-with-permissions`, {
    headers: getAuthHeaders()
  });

  const text = await res.text(); // 🔥 DEBUG

  try {
    return JSON.parse(text);
  } catch {
    console.error("NOT JSON RESPONSE:", text);
    throw new Error("Backend not hit properly");
  }
};

// UPDATE
export const updatePermissions = async (adminId, permissions) => {
  const res = await fetch(`${BASE_URL}/update-permissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      admin_id: adminId,
      permissions
    })
  });

  return res.json();
};