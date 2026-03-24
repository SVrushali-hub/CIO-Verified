

const BASE_URL = "http://localhost:5000/api";

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins-with-permissions`);
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
};

export const updatePermissions = async (adminId, permissions) => {
  const res = await fetch(`${BASE_URL}/update-permissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      admin_id: adminId,
      permissions
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Update failed");
  }

  return res.json();
};