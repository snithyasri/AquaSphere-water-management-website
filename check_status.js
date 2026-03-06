const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const http = require('http');
const fs = require('fs');

async function checkDB() {
    const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');
    console.log(`Checking DB at: ${dbPath}`);
    if (!fs.existsSync(dbPath)) {
        console.error('❌ Database file not found!');
        return;
    }

    const db = new sqlite3.Database(dbPath);

    const query = (sql) => new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    try {
        const users = await query('SELECT count(*) as count FROM users');
        const reports = await query('SELECT count(*) as count FROM reports');
        console.log(`✅ Database connected. Users: ${users[0].count}, Reports: ${reports[0].count}`);
    } catch (err) {
        console.error(`❌ Database query error: ${err.message}`);
    } finally {
        db.close();
    }
}

function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:5000/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ Server is UP on port 5000: ${data}`);
                resolve(true);
            });
        }).on('error', (err) => {
            console.error(`❌ Server is OFFLINE on port 5000: ${err.message}`);
            resolve(false);
        });
        req.end();
    });
}

async function run() {
    console.log('--- DIAGNOSTIC START ---');
    await checkDB();
    await checkPort();
    console.log('--- DIAGNOSTIC END ---');
}

run();
