const express = require("express");

const router = express.Router();

// Import authentication middleware
const authenticateUser = require("../middleware/authmiddleware");

// Import reading controllers
const {
    addReading,
    getReadings,
    updateReading,
    deleteReading
} = require("../controllers/readingcontroller");

// Protect all reading APIs
router.use(authenticateUser);

// Add glucose reading
router.post("/", addReading);

// Get all glucose readings
router.get("/", getReadings);

// Update glucose reading
router.put("/:id", updateReading);

// Delete glucose reading
router.delete("/:id", deleteReading);

module.exports = router;