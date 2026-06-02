require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function fixPostgres() {
    console.log('Starting Postgres Migration...');
    try {
        // Add email column
        console.log('Checking/Adding email column...');
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`;
        console.log('Email column added or already exists.');

        // Add phone column
        console.log('Checking/Adding phone column...');
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
        console.log('Phone column added or already exists.');

        // Ensure unique constraints/indexes
        console.log('Creating indexes...');
        try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`; } catch(e) {}
        try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users(phone)`; } catch(e) {}

        // Reset Admin Alpha
        console.log('Resetting Admin Alpha...');
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('Mousta@2025', 10);
        
        // Check if exists
        const check = await sql`SELECT * FROM users WHERE username = 'Alpha'`;
        if (check.rows.length > 0) {
            await sql`UPDATE users SET email = 'admin@menfop.com', password = ${hash}, role = 'administrateur' WHERE username = 'Alpha'`;
            console.log('Admin Alpha updated.');
        } else {
            await sql`INSERT INTO users (username, email, password, role) VALUES ('Alpha', 'admin@menfop.com', ${hash}, 'administrateur')`;
            console.log('Admin Alpha created.');
        }

        console.log('Postgres Migration Successfully Completed!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    }
}

fixPostgres();