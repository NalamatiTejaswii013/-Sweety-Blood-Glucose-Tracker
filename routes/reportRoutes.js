const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authmiddleware");

const {
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
} = require("../controllers/reportcontroller");

// All report routes require login
router.use(authenticateUser);

// Daily Report
router.get("/daily", getDailyReport);

// Month-to-Date Report
router.get("/month-to-date", getMonthToDateReport);

// Previous Month Report
router.get("/previous-month", getPreviousMonthReport);

module.exports = router;