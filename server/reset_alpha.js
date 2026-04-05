const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'management.db'), (err) => {
    if (err) console.error(err.message);
});

bcrypt.hash('Mousta@2025', 10, (err, hash) => {
    if (err) {
        console.error('Error hashing:', err);
        return;
    }
    db.run('UPDATE users SET password = ?, role = "administrateur" WHERE username = "Alpha"', [hash], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Updated Alpha: ${this.changes} rows affected.`);
            if (this.changes === 0) {
                // If Alpha doesn't exist, insert it
                db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['Alpha', hash, 'administrateur'], function(err) {
                    if (err) console.error(err);
                    else console.log('Inserted Alpha.');
                });
            }
        }
        db.close();
    });
});
