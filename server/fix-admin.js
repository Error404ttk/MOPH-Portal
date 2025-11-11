const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

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

async function fixAdminUser() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const newPassword = 'admin';
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Check if admin exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );
    
    if (users.length === 0) {
      // Create admin user if it doesn't exist
      await connection.execute(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'ผู้ดูแลระบบ', 'admin']
      );
      console.log('✅ Created new admin user');
    } else {
      // Update existing admin user
      await connection.execute(
        'UPDATE users SET password = ?, name = ?, role = ? WHERE username = ?',
        [hashedPassword, 'ผู้ดูแลระบบ', 'admin', 'admin']
      );
      console.log('✅ Reset admin password and updated details');
    }
    
    console.log('\n🔑 Admin login details:');
    console.log('-------------------');
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('\nPlease try logging in with these credentials.');
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the function
fixAdminUser();
