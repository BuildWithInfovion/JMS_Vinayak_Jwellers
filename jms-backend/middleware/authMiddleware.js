// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token (never with a default secret: anyone could forge tokens with it)
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server is not configured (JWT_SECRET missing)." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user payload (id, username, role) to request
    next(); // Move to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
