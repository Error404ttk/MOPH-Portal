const Database = require('better-sqlite3');
const path = require('path');

// Create or connect to SQLite database
const db = new Database(path.join(__dirname, 'database.sqlite'), { verbose: console.log });

// Create tables if they don't exist
function initializeDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert a default admin user if none exists
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = stmt.get();
  
  if (count === 0) {
    const insert = db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)');
    // In a real app, you should hash the password before storing it
    insert.run('admin', 'admin123', 'Admin User', 'admin');
    console.log('Created default admin user');
  }

  console.log('Database initialized successfully');
}

module.exports = {
  db,
  initializeDatabase
};
