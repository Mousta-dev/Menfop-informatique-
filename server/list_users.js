const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'management.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
});
db.all('SELECT id, username, email, phone, role FROM users', [], (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});