const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Constant-time comparison for secrets
const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Simple in-memory limit: 10 attempts per 15 minutes per IP + username
const attempts = new Map();
function limitAttempts(req, res, next) {
  const key = `${req.ip}|${(req.body && req.body.username) || ""}`;
  const now = Date.now();
  const rec = attempts.get(key) || { n: 0, start: now };
  if (now - rec.start > 15 * 60 * 1000) { rec.n = 0; rec.start = now; }
  rec.n += 1;
  attempts.set(key, rec);
  if (attempts.size > 5000) attempts.clear();
  if (rec.n > 10) return res.status(429).json({ message: "Too many attempts. Please wait 15 minutes and try again." });
  next();
}

// @route   POST /api/auth/register
// @desc    Register a new user (owner or staff)
// @access  Private — owner only
router.post("/register", auth, async (req, res) => {
  if (req.user.role !== "owner") {
    return res
      .status(403)
      .json({ message: "Only owners can create new accounts." });
  }

  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide username, password, and role." });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }
  if (!["owner", "staff"].includes(role)) {
    return res.status(400).json({ message: "Role must be owner or staff." });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    user = new User({ username, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", limitAttempts, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    const secret = process.env.JWT_SECRET;

    // This is the most likely point of failure
    if (!secret) {
      console.error("JWT_SECRET is not set.");
      // We explicitly throw an error to make sure it's caught
      throw new Error("JWT_SECRET is not defined in .env file");
    }

    // Sign the token
    jwt.sign(payload, secret, { expiresIn: "30d" }, (err, token) => {
      if (err) {
        console.error("JWT signing error:", err.message);
        throw err; // Re-throw to trigger the catch block
      }
      res.json({ token, user: payload.user });
    });
  } catch (error) {
    // This will catch any error
    console.error("Login failed:", error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Start a password reset. The caller must know the deployment's RECOVERY_KEY
//          (a secret kept by the shop owner). Without it nobody can reset a password —
//          the old version returned a reset token to anyone who knew a username.
// @access  Public (rate-limited)
router.post("/forgot-password", limitAttempts, async (req, res) => {
  const { username, recoveryKey } = req.body || {};
  const expected = process.env.RECOVERY_KEY || "";

  if (!expected) {
    return res.status(403).json({
      message: "Password reset is not enabled. Ask the shop owner to reset your password from Settings, or contact Infovion support.",
    });
  }
  if (!username || !recoveryKey || !safeEqual(String(recoveryKey), expected)) {
    return res.status(400).json({ message: "Username or recovery key is incorrect." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username or recovery key is incorrect." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    res.json({ message: "Recovery key accepted. Set a new password.", resetToken });
  } catch (error) {
    console.error("forgot-password failed:", error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password using the generated token
// @access  Public
router.put("/reset-password/:token", async (req, res) => {
  const { newPassword } = req.body;

  const resetPasswordTokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: resetPasswordTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/change-password
// @desc    Change a user's password
// @access  Private
router.post("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide old and new passwords." });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long." });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "New password must be different from the old password.",
    });
  }

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "The old password you entered is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/reset-user-password
// @desc    The owner sets a new password for a staff member (or themselves)
// @access  Private — owner only
router.post("/reset-user-password", auth, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only the owner can reset passwords." });
  }
  const { username, newPassword } = req.body || {};
  if (!username || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ message: "Give a username and a new password of at least 6 characters." });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found." });
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: `Password updated for ${username}.` });
  } catch (error) {
    console.error("reset-user-password failed:", error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/auth/users
// @desc    List users (names and roles only)
// @access  Private — owner only
router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "owner") return res.status(403).json({ message: "Owner only." });
  const users = await User.find({}, { username: 1, role: 1, createdAt: 1 }).sort({ createdAt: 1 });
  res.json(users);
});

module.exports = router;
