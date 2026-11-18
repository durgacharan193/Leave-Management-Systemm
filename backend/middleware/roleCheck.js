/**
 * Role-Based Access Control Middleware
 * Factory function that returns middleware checking user role
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'manager')
 * @returns {Function} Express middleware
 *
 * Usage: authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — please log in',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };
