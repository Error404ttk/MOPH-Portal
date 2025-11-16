const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURATION ---
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (error) {
  console.error("FATAL ERROR: config.json not found or is invalid. Please create it from config.json.example.");
  process.exit(1);
}

const dbConfig = config.database;
const jwtSecret = config.jwtSecret;

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));


// --- DATABASE CONNECTION ---
let pool;
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.getConnection(); // Test the connection
        console.log("Successfully connected to MySQL database.");
        // Ensure required tables exist (lightweight init)
        const connection = await pool.getConnection();
        try {
          await connection.query(`
            CREATE TABLE IF NOT EXISTS about (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
              id VARCHAR(64) PRIMARY KEY,
              username VARCHAR(100) NOT NULL UNIQUE,
              name VARCHAR(255) NOT NULL,
              role VARCHAR(32) NOT NULL,
              password_hash VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          await connection.query(`
            CREATE TABLE IF NOT EXISTS footer (
              id INT PRIMARY KEY,
              copyrightText VARCHAR(255) NOT NULL,
              descriptionText VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              sort_order INT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          await connection.query(`
            CREATE TABLE IF NOT EXISTS links (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              url TEXT NOT NULL,
              icon VARCHAR(64) NOT NULL,
              description TEXT,
              category_id INT NOT NULL,
              sort_order INT DEFAULT 0,
              FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);

          const [userCountRows] = await connection.query('SELECT COUNT(*) AS cnt FROM users');
          const hasUsers = userCountRows[0]?.cnt > 0;
          if (!hasUsers) {
            const defaultId = 'admin-1';
            const defaultUsername = 'admin';
            const defaultName = 'Administrator';
            const defaultRole = 'admin';
            const defaultPasswordHash = await bcrypt.hash('admin123', 10);
            await connection.execute(
              'INSERT INTO users (id, username, name, role, password_hash) VALUES (?, ?, ?, ?, ?)',
              [defaultId, defaultUsername, defaultName, defaultRole, defaultPasswordHash]
            );
            console.log('Seeded default admin user (username: admin / password: admin123). Please change it after login.');
          }
        } finally {
          connection.release();
        }
    } catch (error) {
        console.error("\nFATAL ERROR: Could not connect to the MySQL database.");
        console.error("Please check your database server is running and the credentials in 'config.json' are correct.");
        console.error("Error details:", error.message, "\n");
        process.exit(1);
    }
}


// --- API ROUTES ---

// Public route to get all data
app.get('/api/data', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get footer data and ensure a default row exists
    const [footerRows] = await connection.query("SELECT * FROM footer WHERE id = 1");
    let footerData = footerRows[0];
    if (!footerData) {
      const defaultFooter = {
        copyrightText: '© 2024 โรงพยาบาลสารภี',
        descriptionText: 'ศูนย์รวมบริการดิจิทัลสุขภาพ'
      };
      await connection.execute(
        `INSERT INTO footer (id, copyrightText, descriptionText) VALUES (1, ?, ?)`,
        [defaultFooter.copyrightText, defaultFooter.descriptionText]
      );
      footerData = defaultFooter;
    }

    // Get categories and their links
    const [categories] = await connection.query("SELECT * FROM categories ORDER BY sort_order ASC");
    const [links] = await connection.query("SELECT * FROM links ORDER BY sort_order ASC");

    const data = categories.map(category => ({
      ...category,
      links: links.filter(link => link.category_id === category.id)
    }));

    // Get About entries and ensure at least one default row
    const [aboutRows] = await connection.query("SELECT * FROM about ORDER BY id ASC");
    let abouts = aboutRows;
    if (!abouts || abouts.length === 0) {
      const defaultAbout = {
        title: 'ภาพรวมองค์กร',
        content: 'โรงพยาบาลสารภีมีความปลอดภัยได้มาตรฐาน มีบริการเป็นเลิศ ประสานเครือข่าย สร้างสรรค์นวตกรรมนำสู่สากล'
      };
      const [insertResult] = await connection.execute(
        `INSERT INTO about (title, content) VALUES (?, ?)`,
        [defaultAbout.title, defaultAbout.content]
      );
      abouts = [{ id: insertResult.insertId, ...defaultAbout }];
    }

    // Get users (excluding passwords). Do not select mustChangePassword directly in case the column doesn't exist.
    const [userRows] = await connection.query("SELECT id, username, name, role FROM users");

    // Normalize users shape and default mustChangePassword to false if not present
    const users = userRows.map(u => ({ ...u, mustChangePassword: !!u.mustChangePassword }));

    connection.release();
    res.json({ data, footerData, users, abouts });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Failed to fetch data from the server.' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Some databases may not have password_hash yet; fallback cautiously
    const storedHash = user.password_hash || user.password;
    if (!storedHash) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, storedHash);
    } catch (e) {
      // If storedHash is not a valid bcrypt hash, treat as invalid credentials
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
    
    // Exclude password hash from the response
    const { password_hash, ...userResponse } = user;

    res.json({ token, user: userResponse });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- PROTECTED ROUTES (require authentication) ---

// Save all data
app.post('/api/data', authMiddleware, async (req, res) => {
    const { data, footerData, users, abouts } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Upsert Footer (ensure row id=1 exists)
        await connection.execute(
            `INSERT INTO footer (id, copyrightText, descriptionText)
             VALUES (1, ?, ?)
             ON DUPLICATE KEY UPDATE
               copyrightText = VALUES(copyrightText),
               descriptionText = VALUES(descriptionText)`,
            [footerData?.copyrightText || '', footerData?.descriptionText || '']
        );

        // 2. Update Categories and Links
        await connection.execute('DELETE FROM links');
        await connection.execute('DELETE FROM categories');
        
        for (const [catIndex, category] of data.entries()) {
            // Let DB assign category.id to avoid out-of-range errors
            const [catResult] = await connection.execute(
                `INSERT INTO categories (title, description, sort_order) VALUES (?, ?, ?)`,
                [category.title, category.description || '', catIndex]
            );
            const newCategoryId = catResult.insertId;

            for (const [linkIndex, link] of category.links.entries()) {
                await connection.execute(
                    `INSERT INTO links (name, url, icon, description, category_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
                    [link.name || '', link.url || '', link.icon || 'Link', link.description || '', newCategoryId, linkIndex]
                );
            }
        }
        
        // 3. Upsert About entries (replace-all strategy)
        if (Array.isArray(abouts)) {
            await connection.execute('DELETE FROM about');
            for (const about of abouts) {
                await connection.execute(
                    `INSERT INTO about (title, content) VALUES (?, ?)`,
                    [about.title || '', about.content || '']
                );
            }
        }

        // 4. Update Users (very carefully)
        const [existingUsers] = await connection.query('SELECT * FROM users');
        
        for (const user of users) {
           const existingUser = existingUsers.find(u => u.id.toString() === user.id.toString());
           if (existingUser) { // Update existing user
               let newPasswordHash = null;
               // Only hash and update password if provided and different from existing hash
               if (user.password && user.password !== existingUser.password_hash) {
                   newPasswordHash = await bcrypt.hash(user.password, 10);
               }
               if (newPasswordHash) {
                   await connection.execute(
                       'UPDATE users SET username = ?, name = ?, role = ?, password_hash = ? WHERE id = ?',
                       [user.username, user.name, user.role, newPasswordHash, user.id]
                   );
               } else {
                   // Do not touch password_hash if no new password supplied
                   await connection.execute(
                       'UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?',
                       [user.username, user.name, user.role, user.id]
                   );
               }
           } else { // Add new user
               const rawPassword = user.password || 'changeme';
               const newPasswordHash = await bcrypt.hash(rawPassword, 10);
               await connection.execute(
                   'INSERT INTO users (id, username, name, role, password_hash) VALUES (?, ?, ?, ?, ?)',
                   [user.id, user.username, user.name, user.role, newPasswordHash]
               );
           }
        }
        // Handle deletions
        const userIdsToKeep = users.map(u => u.id.toString());
        const usersToDelete = existingUsers.filter(u => !userIdsToKeep.includes(u.id.toString()));
        for (const userToDelete of usersToDelete) {
             await connection.execute('DELETE FROM users WHERE id = ?', [userToDelete.id]);
        }

        await connection.commit();
        res.status(200).json({ message: 'Data saved successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Failed to save data.' });
    } finally {
        connection.release();
    }
});


// Reset data to initial state from SQL file
app.post('/api/reset', authMiddleware, async (req, res) => {
    // Only allow admins to reset
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const connection = await pool.getConnection();
    try {
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
        const queries = initSql.split(';').filter(q => q.trim() !== '');
        
        await connection.beginTransaction();
        
        // Simple drop and recreate
        await connection.query('DROP TABLE IF EXISTS links, categories, footer, users, about;');
        
        for (const query of queries) {
            await connection.query(query);
        }
        
        await connection.commit();
        res.status(200).json({ message: 'Data has been reset to default.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error resetting database:', error);
        res.status(500).json({ message: 'Failed to reset data.' });
    } finally {
        connection.release();
    }
});


// Serve the main index file for any other request (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- START SERVER ---
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
