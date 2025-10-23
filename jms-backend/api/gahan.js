// backend/api/gahan.js
const express = require("express");
const router = express.Router();
const Gahan = require("../models/Gahan");
const authMiddleware = require("../middleware/authMiddleware");
const { getNextSequence } = require("../models/Counter"); // <-- Import counter

router.use(authMiddleware);

// POST /api/gahan - Add a new Gahan record
router.post("/", async (req, res) => {
  const {
    /* ... fields ... */ customerName,
    customerAddress,
    customerMobile,
    itemName,
    itemWeight,
    itemPurity,
    amountGiven,
    interestRate,
    pawnDate,
    dueDate,
    notes,
  } = req.body;

  if (
    !customerName ||
    !itemName ||
    !itemWeight ||
    !amountGiven ||
    !interestRate ||
    !dueDate
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // --- Get the next Gahan record number ---
    const nextRecordNumber = await getNextSequence("gahanRecord"); // Use a unique counter name
    // ----------------------------------------

    const newGahan = new Gahan({
      recordNumber: nextRecordNumber, // <-- Save the number
      customerName,
      customerAddress,
      customerMobile,
      itemName,
      itemWeight,
      itemPurity,
      amountGiven,
      interestRate,
      pawnDate: pawnDate || Date.now(),
      dueDate,
      notes,
      createdBy: req.user.id,
    });

    const savedGahan = await newGahan.save();
    res.status(201).json(savedGahan);
  } catch (error) {
    console.error("Error saving Gahan record:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/gahan - Get active/overdue records
router.get("/", async (req, res) => {
  try {
    const gahanRecords = await Gahan.find({ status: { $ne: "Released" } }).sort(
      { dueDate: 1 }
    );
    res.status(200).json(gahanRecords);
  } catch (error) {
    console.error("Error fetching active Gahan:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- NEW Route: GET /api/gahan/all ---
// @desc    Get ALL Gahan records (including released)
// @access  Private
router.get("/all", async (req, res) => {
  try {
    // Find all records, sort by pawn date descending
    const allGahanRecords = await Gahan.find().sort({ pawnDate: -1 });
    res.status(200).json(allGahanRecords);
  } catch (error) {
    console.error("Error fetching all Gahan records:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching all Gahan records." });
  }
});
// ------------------------------------

// GET /api/gahan/:id - Get single record
router.get("/:id", async (req, res) => {
  /* ... unchanged ... */ try {
    const gahanRecord = await Gahan.findById(req.params.id);
    if (!gahanRecord) {
      return res.status(404).json({ message: "Gahan record not found." });
    }
    res.status(200).json(gahanRecord);
  } catch (error) {
    console.error("Error fetching Gahan record:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// PUT /api/gahan/:id/release - Mark as released
router.put("/:id/release", async (req, res) => {
  /* ... unchanged ... */ try {
    const gahanRecord = await Gahan.findById(req.params.id);
    if (!gahanRecord) {
      return res.status(404).json({ message: "Gahan record not found." });
    }
    if (gahanRecord.status === "Released") {
      return res.status(400).json({ message: "Item already released." });
    }
    gahanRecord.status = "Released";
    gahanRecord.releaseDate = Date.now();
    await gahanRecord.save();
    res.status(200).json(gahanRecord);
  } catch (error) {
    console.error("Error releasing Gahan record:", error);
    res
      .status(500)
      .json({ message: "Server error while releasing Gahan record." });
  }
});

module.exports = router;
