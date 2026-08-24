// Usage: router.get('/admin-only', protect, requireRole('admin'), handler)
// Must run after `protect` so req.user is populated.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`This action requires role: ${allowedRoles.join(" or ")}`));
    }
    next();
  };
}

// For farmer-only routes: also blocks farmers whose account is not yet approved by admin.
function requireApprovedFarmer(req, res, next) {
  if (!req.user || req.user.role !== "farmer") {
    res.status(403);
    return next(new Error("This action requires a farmer account"));
  }
  if (req.user.farmerProfile?.approvalStatus !== "approved") {
    res.status(403);
    return next(new Error("Your farmer account is pending admin approval"));
  }
  next();
}

module.exports = { requireRole, requireApprovedFarmer };
