const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: '192.168.99.71',
  port: 3307,
  user: 'srp',
  password: 'S@r@pee11135',
  database: 'moph_portal_db',
};

async function cleanupDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Starting database cleanup...');
    
    // 1. Delete all non-admin users
    const [deleteUsers] = await connection.execute(
      "DELETE FROM users WHERE username != 'admin'"
    );
    console.log(`✅ Removed ${deleteUsers.affectedRows} non-admin users`);
    
    // 2. Truncate categories and links tables (they have foreign key constraints)
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const [clearCategories] = await connection.execute('TRUNCATE TABLE categories');
    console.log('✅ Cleared categories table');
    
    const [clearLinks] = await connection.execute('TRUNCATE TABLE links');
    console.log('✅ Cleared links table');
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // 3. Reset admin password to 'admin'
    const hashedPassword = await bcrypt.hash('admin', 10);
    const [updateAdmin] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    if (updateAdmin.affectedRows > 0) {
      console.log('✅ Reset admin password to: admin');
    } else {
      // If admin user doesn't exist, create one
      await connection.execute(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'ผู้ดูแลระบบ', 'admin']
      );
      console.log('✅ Created admin user with password: admin');
    }
    
    console.log('\n✨ Database cleanup completed successfully!');
    console.log('You can now login with:');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

// Run the cleanup
cleanupDatabase();
