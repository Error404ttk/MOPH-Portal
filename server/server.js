// Backend server for MOPH Portal
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const app = express();
const port = 3001;

// Database configuration
const dbConfig = {
  host: '192.168.99.71',
  port: 3307,
  user: 'srp',
  password: 'S@r@pee11135',
  database: 'moph_portal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database tables
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if users table exists, if not create it
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      await connection.query(`
        CREATE TABLE users (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100),
          role VARCHAR(20) DEFAULT 'editor',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created users table');
    }

    // Check if admin user exists, if not create one
    const [rows] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const adminId = Date.now().toString();
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      await connection.query(
        'INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'admin', hashedPassword, 'ผู้ดูแลระบบ', 'admin']
      );
      console.log('✅ Created default admin user');
    }

    // Create categories table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create links table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        url VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        description TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    return false;
  } finally {
    if (connection) await connection.release();
  }
}

// Test database connection and initialize tables
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    
    // Initialize database tables
    await initializeDatabase();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  } finally {
    if (connection) await connection.release();
  }
}

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Handle preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    version: '1.0.0'
  });
});

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to structure data for the frontend
const structureData = (categories, links) => {
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, links: [] });
  });
  links.forEach(link => {
    if (categoryMap.has(link.category_id)) {
      categoryMap.get(link.category_id).links.push(link);
    }
  });
  return Array.from(categoryMap.values());
};

// API Endpoint to get all application data
app.get('/api/data', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('GET /api/data: Fetching data from database...');

    // In a real app, footer data might also be in the database
    const footerData = {
      copyrightText: `© ${new Date().getFullYear()} Ministry of Public Health. All rights reserved.`,
      descriptionText: "Dashboard for internal and public use."
    };

    const [users] = await connection.query('SELECT id, username, password, name, role FROM users');
    const [categories] = await connection.query('SELECT * FROM categories ORDER BY sort_order ASC');
    const [links] = await connection.query('SELECT * FROM links ORDER BY sort_order ASC');
    
    const structuredLinkData = structureData(categories, links);
    
    console.log(`Fetched ${users.length} users, ${categories.length} categories, ${links.length} links.`);

    res.json({
      data: structuredLinkData,
      footerData,
      users,
      dbConfig: { ...dbConfig, isInitialized: true, password: '' } // Don't send password to client
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ message: 'Failed to fetch data from the database.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// API Endpoint to save all application data
app.post('/api/data', async (req, res) => {
    const { data: categoriesData, footerData, users } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        console.log('POST /api/data: Saving data to database...');

        // Clear existing content data
        await connection.query('DELETE FROM links');
        await connection.query('DELETE FROM categories');
        await connection.query('ALTER TABLE categories AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE links AUTO_INCREMENT = 1');

        // Insert new categories and collect their new IDs
        const categoryIdMap = new Map();
        for (const [index, category] of categoriesData.entries()) {
            const [result] = await connection.query(
                'INSERT INTO categories (title, description, sort_order) VALUES (?, ?, ?)',
                [category.title, category.description || '', index]
            );
            categoryIdMap.set(index, result.insertId);
        }

        // Insert links with new category IDs
        for (const [catIndex, category] of categoriesData.entries()) {
            const newCatId = categoryIdMap.get(catIndex);
            if (newCatId && category.links.length > 0) {
                const linkValues = category.links.map((link, linkIndex) => [
                    newCatId,
                    link.name,
                    link.url,
                    link.icon,
                    link.description || '',
                    linkIndex
                ]);
                await connection.query(
                    'INSERT INTO links (category_id, name, url, icon, description, sort_order) VALUES ?',
                    [linkValues]
                );
            }
        }
        
        // Upsert users
        for (const user of users) {
             await connection.query(
                `INSERT INTO users (id, username, password, name, role) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 username=VALUES(username), password=VALUES(password), name=VALUES(name), role=VALUES(role)`,
                [user.id, user.username, user.password, user.name, user.role]
            );
        }

        await connection.commit();
        console.log('Data saved successfully.');
        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Failed to save data:', error);
        res.status(500).json({ message: 'Failed to save data to the database.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, name, role = 'editor' } = req.body;
  let connection;
  
  if (!username || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, และชื่อ-สกุล)' 
    });
  }

  try {
    connection = await pool.getConnection();
    
    // Check if username already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?', 
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' 
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user with generated ID
    const userId = Date.now().toString();
    await connection.query(
      'INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, name, role]
    );
    
    // Get the newly created user
    const [users] = await connection.query(
      'SELECT id, username, name, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length > 0) {
      const user = users[0];
      res.status(201).json({
        success: true,
        message: 'สมัครสมาชิกสำเร็จ',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } else {
      throw new Error('ไม่สามารถสร้างผู้ใช้ใหม่ได้');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่ในภายหลัง',
      error: error.message
    });
  } finally {
    if (connection) await connection.release();
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const requestId = Date.now();
  console.log(`[${requestId}] Login request received`);
  
  // Log request details (without sensitive data)
  console.log(`[${requestId}] Headers:`, {
    origin: req.headers.origin,
    'content-type': req.headers['content-type']
  });
  console.log(`[${requestId}] Body:`, { 
    username: req.body.username ? 'provided' : 'missing',
    password: req.body.password ? 'provided' : 'missing' 
  });
  
  const { username, password } = req.body;
  let connection;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' 
    });
  }
  
  try {
    connection = await pool.getConnection();
    
    // Get user by username
    console.log(`[${requestId}] Querying user:`, username);
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    console.log(`[${requestId}] Found users:`, users.length);
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
      });
    }
    
    const user = users[0];
    
    // Compare password hashes
    console.log(`[${requestId}] Comparing password for user:`, user.username);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[${requestId}] Password match:`, isPasswordValid);
    
    if (!isPasswordValid) {
      console.log(`[${requestId}] Invalid password for user:`, user.username);
      return res.status(401).json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
      });
    }
    
    // In a real application, generate a JWT token here
    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token: 'dummy-jwt-token' // Replace with actual JWT in production
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่ในภายหลัง',
      error: error.message
    });
  } finally {
    if (connection) await connection.release();
  }
});

// Function to find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(startPort);
    });
    
    server.listen(startPort, '0.0.0.0');
  });
};

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to the database. Please check your configuration.');
      process.exit(1);
    }

    // Find an available port starting from 3001
    const availablePort = await findAvailablePort(port);
    
    // Start the server
    const server = app.listen(availablePort, '0.0.0.0', () => {
      const actualPort = server.address().port;
      console.log(`\n🚀 MOPH Portal backend server running on http://localhost:${actualPort}`);
      console.log('\nAvailable endpoints:');
      console.log(`- GET  http://localhost:${actualPort}/api/data`);
      console.log(`- POST http://localhost:${actualPort}/api/login`);
      console.log(`- POST http://localhost:${actualPort}/api/register`);
      console.log('\nUse Ctrl+C to stop the server\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${availablePort} is in use, trying another port...`);
        // Try to start the server again with a different port
        startServer();
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server has been stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1);
  }
};

startServer();