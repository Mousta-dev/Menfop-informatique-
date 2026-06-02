const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'management.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Starting migration...');
    
    // Add columns one by one
    db.run("ALTER TABLE users ADD COLUMN email TEXT", (err) => {
        if (err) console.log('Email column already exists or error:', err.message);
        else console.log('Email column added.');
    });

    db.run("ALTER TABLE users ADD COLUMN phone TEXT", (err) => {
        if (err) console.log('Phone column already exists or error:', err.message);
        else console.log('Phone column added.');
    });

    // Check if Alpha exists
    db.get("SELECT * FROM users WHERE username = 'Alpha'", (err, row) => {
        if (err) {
            console.error('Error checking user:', err.message);
            return;
        }

        const pass = 'Mousta@2025';
        bcrypt.hash(pass, 10, (err, hash) => {
            if (row) {
                // Update password to be sure
                db.run("UPDATE users SET password = ?, email = ?, role = 'administrateur' WHERE username = 'Alpha'", [hash, 'admin@menfop.com'], (err) => {
                    if (err) console.error('Error updating Alpha:', err.message);
                    else console.log('Admin Alpha password reset and email set.');
                });
            } else {
                // Insert Alpha
                db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", ['Alpha', 'admin@menfop.com', hash, 'administrateur'], (err) => {
                    if (err) console.error('Error inserting Alpha:', err.message);
                    else console.log('Admin Alpha created.');
                });
            }
        });
    });
});

setTimeout(() => {
    db.close();
    console.log('Migration finished.');
}, 2000);