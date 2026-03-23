const BASE_URL = "http://localhost:5000/api";

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins-with-permissions`);
  return res.json();
};

export const updatePermissions = async (adminId, permissions) => {
  await fetch(`${BASE_URL}/update-permissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      admin_id: adminId,
      permissions
    })
  });
};