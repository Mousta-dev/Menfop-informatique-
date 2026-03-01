const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./management.db');

db.all('SELECT id, name FROM missions', [], (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(rows));
    db.close();
});
