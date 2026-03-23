// 🔥 Only Super Admin Access
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPERADMIN") {
    return res.status(403).json({
      message: "Access denied. Super Admin only.",
    });
  }

  next();
};

// (Optional) Future use
export const requireAdmin = (req, res, next) => {
  if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};