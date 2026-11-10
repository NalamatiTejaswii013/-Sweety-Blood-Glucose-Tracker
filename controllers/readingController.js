const pool = require("../config/db");

const validSlots = [
    "Morning",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// Validate date format
const isValidDate = (date) => {
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

// Check future date using PostgreSQL
const isFutureDate = async (date) => {
    const result = await pool.query(
        "SELECT $1::date > CURRENT_DATE AS is_future",
        [date]
    );

    return result.rows[0].is_future;
};

// ADD GLUCOSE READING
const addReading = async (req, res) => {
    try {
        const { reading_date, time_slot, glucose_value } = req.body;

        // Required value
        if (
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ""
        ) {
            return res.status(400).json({
                message: "Please enter a glucose value."
            });
        }

        // Validate glucose value
        const value = Number(glucose_value);

        if (
            !Number.isInteger(value) ||
            value < 40 ||
            value > 600
        ) {
            return res.status(400).json({
                message: "Value must be between 40 and 600 mg/dl."
            });
        }

        // Validate date and slot
        if (!reading_date || !time_slot) {
            return res.status(400).json({
                message: "Date and time slot are required."
            });
        }

        if (!isValidDate(reading_date)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        if (await isFutureDate(reading_date)) {
            return res.status(400).json({
                message: "Date cannot be in the future."
            });
        }

        if (!validSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Please select a valid time slot."
            });
        }

        // Check duplicate slot
        const existing = await pool.query(
            `SELECT id FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3`,
            [req.user.id, reading_date, time_slot]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: `You already have an ${time_slot} reading for this date.`
            });
        }

        // Check maximum 4 readings
        const count = await pool.query(
            `SELECT COUNT(*) FROM readings
             WHERE user_id = $1
             AND reading_date = $2`,
            [req.user.id, reading_date]
        );

        if (Number(count.rows[0].count) >= 4) {
            return res.status(400).json({
                message: "You can add only 4 readings per day."
            });
        }

        // Insert reading
        const result = await pool.query(
            `INSERT INTO readings
             (user_id, reading_date, time_slot, glucose_value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, reading_date, time_slot, value]
        );

        return res.status(201).json({
            success: true,
            message: "Glucose reading added successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Add Reading Error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Duplicate reading for this date and time slot."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add reading."
        });
    }
};


// GET ALL READINGS
const getReadings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, id DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error("Get Readings Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch readings."
        });
    }
};


// UPDATE READING
const updateReading = async (req, res) => {
    try {
        const { id } = req.params;
        const { reading_date, time_slot, glucose_value } = req.body;

        // Required fields
        if (
            !reading_date ||
            !time_slot ||
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ""
        ) {
            return res.status(400).json({
                message: "Date, time slot and glucose value are required."
            });
        }

        // Validate glucose value
        const value = Number(glucose_value);

        if (
            !Number.isInteger(value) ||
            value < 40 ||
            value > 600
        ) {
            return res.status(400).json({
                message: "Value must be between 40 and 600 mg/dl."
            });
        }

        // Validate date
        if (!isValidDate(reading_date)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        if (await isFutureDate(reading_date)) {
            return res.status(400).json({
                message: "Date cannot be in the future."
            });
        }

        // Validate slot
        if (!validSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Please select a valid time slot."
            });
        }

        // Check ownership
        const current = await pool.query(
            `SELECT id FROM readings
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (current.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        // Check duplicate slot
        const duplicate = await pool.query(
            `SELECT id FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3
             AND id <> $4`,
            [req.user.id, reading_date, time_slot, id]
        );

        if (duplicate.rows.length > 0) {
            return res.status(409).json({
                message: `You already have an ${time_slot} reading for this date.`
            });
        }

        // Check maximum 4 readings per day
        const count = await pool.query(
            `SELECT COUNT(*) FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND id <> $3`,
            [req.user.id, reading_date, id]
        );

        if (Number(count.rows[0].count) >= 4) {
            return res.status(400).json({
                message: "You can add only 4 readings per day."
            });
        }

        // Update database
        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1,
                 time_slot = $2,
                 glucose_value = $3
             WHERE id = $4
             AND user_id = $5
             RETURNING *`,
            [reading_date, time_slot, value, id, req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: "Reading updated successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Update Reading Error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Duplicate reading for this date and time slot."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update reading."
        });
    }
};


// DELETE READING
const deleteReading = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1
             AND user_id = $2
             RETURNING id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reading deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Reading Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete reading."
        });
    }
};


// EXPORT CONTROLLERS
module.exports = {
    addReading,
    getReadings,
    updateReading,
    deleteReading
};