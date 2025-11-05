const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); // Import the middleware

// @route   POST /api/auth/register
// @desc    Register a new user (owner or staff)
// @access  Public (for now; later we'll make this Owner-only)
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide username, password, and role." });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    user = new User({
      username,
      password,
      role,
    });

    // Hash password
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
router.post("/login", async (req, res) => {
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

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_default_secret_key", // We must add this to .env
      { expiresIn: "30d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// **********************************************
// NEW ROUTE: Change Password
// **********************************************
// @route   POST /api/auth/change-password
// @desc    Change a user's password
// @access  Private
router.post("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // ID comes from the JWT via auth middleware

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide old and new passwords." });
  }

  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json({
        message: "New password must be different from the old password.",
      });
  }

  try {
    let user = await User.findById(userId);
    if (!user) {
      // Should theoretically not happen if auth middleware passed
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "The old password you entered is incorrect." });
    }

    // 2. Hash and save the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
