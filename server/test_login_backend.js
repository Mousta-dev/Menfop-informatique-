const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'management.db');
const db = new sqlite3.Database(dbPath);

const identifier = 'Alpha';
const password = 'Mousta@2025';

db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ?', [identifier, identifier, identifier], async (err, user) => {
    if (err) {
        console.error('DB Error:', err.message);
        db.close();
        return;
    }
    if (!user) {
        console.log('User not found');
        db.close();
        return;
    }

    console.log('User found:', user.username);
    const valid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', valid);
    db.close();
});