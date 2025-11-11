const mysql = require('mysql2/promise');

const dbConfig = {
  host: '192.168.99.71',
  port: 3307,
  user: 'srp',
  password: 'S@r@pee11135',
  database: 'moph_portal_db'
};

async function checkUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check users table
    const [users] = await connection.query('SELECT id, username, name, role FROM users');
    console.log('Current users in database:');
    console.table(users);
    
    // Check if testuser exists
    const [testUser] = await connection.query(
      'SELECT * FROM users WHERE username = ?', 
      ['testuser']
    );
    
    if (testUser.length > 0) {
      console.log('\nTest user exists:', testUser[0]);
    } else {
      console.log('\nTest user does not exist. Creating test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      await connection.query(
        'INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [Date.now().toString(), 'testuser', hashedPassword, 'Test User', 'editor']
      );
      
      console.log('Test user created successfully!');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

checkUsers();
