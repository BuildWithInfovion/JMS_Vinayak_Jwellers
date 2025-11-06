const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// @route   POST /api/auth/register
// @desc    Register a new user (owner or staff)
// @access  Public
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

  // This log MUST appear
  console.log(`\n[DEBUG] /api/auth/login route HIT. User: ${username}`);

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("[DEBUG] Login failed: User not found.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[DEBUG] Login failed: Password mismatch.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    console.log("[DEBUG] User authenticated. Creating JWT payload.");

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
      console.error(
        "[DEBUG] !!! CRITICAL ERROR !!! JWT_SECRET is undefined or null."
      );
      // We explicitly throw an error to make sure it's caught
      throw new Error("JWT_SECRET is not defined in .env file");
    }

    console.log("[DEBUG] JWT_SECRET is present. Signing token...");

    // Sign the token
    jwt.sign(payload, secret, { expiresIn: "30d" }, (err, token) => {
      if (err) {
        console.error("[DEBUG] !!! JWT SIGNING ERROR !!!", err.message);
        throw err; // Re-throw to trigger the catch block
      }
      console.log("[DEBUG] JWT signing successful.\n");
      res.json({ token, user: payload.user });
    });
  } catch (error) {
    // This will catch any error
    console.error("[DEBUG] Login route failed in catch block:", error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (generates token)
// @access  Public
router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({
        message:
          "If the user exists, a password reset link has been processed. Check the server logs (or email service, when implemented).",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(
      `\n\n--- PASSWORD RESET TOKEN for ${username}: ${resetToken} ---\n\n`
    );

    res.json({
      message:
        "Reset link generated. In a real scenario, this would be emailed. For development, check server logs.",
      dev_token: resetToken,
    });
  } catch (error) {
    console.error(error.message);
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

module.exports = router;
