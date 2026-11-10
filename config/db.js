
require("dotenv").config();

const { Pool, types } = require("pg");

// Prevent PostgreSQL DATE values from being converted into JavaScript dates.
types.setTypeParser(1082, (value) => value);

// PostgreSQL database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Check database connection
pool.connect()
    .then((client) => {
        console.log("PostgreSQL Connected Successfully!");
        client.release();
    })
    .catch((error) => {
        console.error("Database Connection Failed:", error.message);
    });

// Handle unexpected database errors
pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL Error:", error.message);
});

module.exports = pool;
