const pool = require("./config/db");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
    try {
        console.log("Starting database seeding...");

        // Create demo user
        const name = "Demo User";
        const email = "demo@sweety.com";
        const password = "Demo@12345";

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email)
             DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [name, email, hashedPassword]
        );

        const userId = userResult.rows[0].id;

        // Sample glucose readings
        const readings = [
            ["Morning", 95],
            ["After breakfast", 130],
            ["After lunch", 145],
            ["After dinner", 125]
        ];

        for (const [timeSlot, glucoseValue] of readings) {
            await pool.query(
                `INSERT INTO readings
                 (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, CURRENT_DATE, $2, $3)
                 ON CONFLICT (user_id, reading_date, time_slot)
                 DO NOTHING`,
                [userId, timeSlot, glucoseValue]
            );
        }

        console.log("Database seeding completed successfully!");
        console.log("Demo Email:", email);
        console.log("Demo Password:", password);

    } catch (error) {
        console.error("Seed Error:", error.message);
    } finally {
        await pool.end();
    }
};

seedDatabase();