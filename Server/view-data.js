const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n--- 👥 USERS TABLE ---');
db.all('SELECT id, name, email, role, location FROM users', [], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    if (rows.length === 0) {
        console.log('No users found.');
    } else {
        console.table(rows);
    }

    console.log('\n--- 📋 REPORTS TABLE ---');
    db.all('SELECT * FROM reports', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (rows.length === 0) {
            console.log('No reports found.');
        } else {
            console.table(rows);
        }
        db.close();
    });
});
