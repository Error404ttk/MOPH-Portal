const mysql = require('mysql2/promise');

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

async function checkAdminUser() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );
    
    if (users.length === 0) {
      console.log('❌ No admin user found in the database');
      return;
    }
    
    const admin = users[0];
    console.log('\n🔍 Admin User Details:');
    console.log('-------------------');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Created At: ${admin.created_at}`);
    console.log('\nNote: Password is hashed for security.');
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the function
checkAdminUser();
