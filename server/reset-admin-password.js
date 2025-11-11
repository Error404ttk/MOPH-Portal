const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Database configuration - same as in server.js
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

async function resetAdminPassword() {
  const newPassword = 'admin'; // New password
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the admin password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password has been reset successfully!');
      console.log('Username: admin');
      console.log('New password: admin');
    } else {
      // If no admin user exists, create one
      const adminId = Date.now().toString();
      await connection.execute(
        'INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'admin', hashedPassword, 'ผู้ดูแลระบบ', 'admin']
      );
      console.log('✅ Admin user created with default password!');
      console.log('Username: admin');
      console.log('Password: admin');
    }
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the function
resetAdminPassword();
