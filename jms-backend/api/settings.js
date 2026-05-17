const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

const DEFAULTS = {
  gst_enabled: false,
  gst_number: "",
};

// GET /api/settings — returns all settings merged with defaults
router.get("/", async (req, res) => {
  try {
    const records = await Setting.find();
    const settings = { ...DEFAULTS };
    records.forEach((r) => {
      settings[r.key] = r.value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error fetching settings." });
  }
});

// PUT /api/settings — upsert one or more key/value pairs
// Body: { gst_enabled: true, gst_number: "27XXXXX" }
router.put("/", async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only owners can change settings." });
  }
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));
    if (ops.length > 0) await Setting.bulkWrite(ops);
    const records = await Setting.find();
    const settings = { ...DEFAULTS };
    records.forEach((r) => {
      settings[r.key] = r.value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error saving settings." });
  }
});

module.exports = router;
