const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authroutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Blood Glucose Reading Routes
app.use("/api/readings", readingRoutes);

// Reports Routes
app.use("/api/reports", reportRoutes);

// Home API
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Sweety Blood Glucose Tracker API"
    });
});

// Database Testing API
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            message: "PostgreSQL Connected Successfully!",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Handle Invalid Routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error("Server Error:", error.message);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sweety Server running on port ${PORT}`);
});