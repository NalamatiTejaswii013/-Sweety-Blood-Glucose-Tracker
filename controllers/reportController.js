const pool = require("../config/db");

// DAILY REPORT
const getDailyReport = async (req, res) => {
    try {
        const date = req.query.date;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Please provide a date."
            });
        }

        const result = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date = $2::date
             ORDER BY
             CASE time_slot
                WHEN 'Morning' THEN 1
                WHEN 'After breakfast' THEN 2
                WHEN 'After lunch' THEN 3
                WHEN 'After dinner' THEN 4
             END`,
            [req.user.id, date]
        );

        const values = result.rows.map(row => row.glucose_value);

        const highest = values.length ? Math.max(...values) : null;
        const lowest = values.length ? Math.min(...values) : null;
        const average = values.length
            ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
            : null;

        return res.status(200).json({
            success: true,
            report: {
                date,
                highest,
                lowest,
                average,
                count: values.length,
                readings: result.rows
            },
            message: values.length
                ? "Daily report generated successfully."
                : "No readings found for this date."
        });

    } catch (error) {
        console.error("Daily Report Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to generate daily report."
        });
    }
};


// MONTH-TO-DATE REPORT
const getMonthToDateReport = async (req, res) => {
    try {
        const date = req.query.date;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Please provide a date."
            });
        }

        const result = await pool.query(
            `SELECT glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= date_trunc('month', $2::date)::date
             AND reading_date <= $2::date`,
            [req.user.id, date]
        );

        const values = result.rows.map(row => row.glucose_value);

        const highest = values.length ? Math.max(...values) : null;
        const lowest = values.length ? Math.min(...values) : null;
        const average = values.length
            ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
            : null;

        return res.status(200).json({
            success: true,
            report: {
                from: `${date.slice(0, 7)}-01`,
                to: date,
                highest,
                lowest,
                average,
                count: values.length
            },
            message: values.length
                ? "Month-to-date report generated successfully."
                : "No readings found for this period."
        });

    } catch (error) {
        console.error("Month-to-Date Report Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to generate month-to-date report."
        });
    }
};


// PREVIOUS MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
    try {
        const date = req.query.date;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Please provide a date."
            });
        }

        const result = await pool.query(
            `SELECT glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= (
                date_trunc('month', $2::date) - INTERVAL '1 month'
             )::date
             AND reading_date < date_trunc('month', $2::date)::date`,
            [req.user.id, date]
        );

        const values = result.rows.map(row => row.glucose_value);

        const highest = values.length ? Math.max(...values) : null;
        const lowest = values.length ? Math.min(...values) : null;
        const average = values.length
            ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
            : null;

        const previousMonth = new Date(date + "T12:00:00");
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const monthName = previousMonth.toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });

        return res.status(200).json({
            success: true,
            report: {
                month: monthName,
                highest,
                lowest,
                average,
                count: values.length
            },
            message: values.length
                ? "Previous month report generated successfully."
                : "No readings found for the previous month."
        });

    } catch (error) {
        console.error("Previous Month Report Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to generate previous month report."
        });
    }
};


module.exports = {
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
};