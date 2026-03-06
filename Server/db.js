const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

const connectDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('citizen', 'volunteer', 'admin')) NOT NULL,
                location TEXT,
                skills TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

      // Create Reports table
      db.run(`CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                assignedTo INTEGER,
                location TEXT NOT NULL,
                issue TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (assignedTo) REFERENCES users (id)
            )`, (err) => {
        if (err) {
          console.error('❌ Schema initialization error:', err.message);
          reject(err);
        } else {
          console.log('📦 Database tables initialized.');
          resolve(db);
        }
      });
    });
  });
};

module.exports = connectDB;
module.exports.db = db;

// Helper to run query and return all results
module.exports.all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to get a single row
module.exports.get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper to run a command (INSERT, UPDATE, DELETE)
module.exports.run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};
