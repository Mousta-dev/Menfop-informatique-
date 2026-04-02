const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/management.db', (err) => {
    if (err) console.error(err.message);
});
db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});