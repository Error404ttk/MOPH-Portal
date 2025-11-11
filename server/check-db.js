const mysql = require('mysql2/promise');

const dbConfig = {
  host: '192.168.99.71',
  port: 3307,
  user: 'srp',
  password: 'S@r@pee11135',
  database: 'moph_portal_db'
};

async function checkDatabase() {
  let connection;
  try {
    // 1. Test connection
    console.log('🔍 Testing database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    // 2. Check if tables exist
    console.log('\n📊 Checking tables...');
    const [tables] = await connection.query("SHOW TABLES;");
    console.log('Found tables:', tables.map(t => Object.values(t)[0]).join(', ') || 'No tables found');

    // 3. Check users table structure
    if (tables.some(t => Object.values(t)[0] === 'users')) {
      console.log('\n👥 Users table structure:');
      const [columns] = await connection.query("DESCRIBE users;");
      console.table(columns);
      
      // 4. Check if admin user exists
      const [users] = await connection.query("SELECT id, username, name, role FROM users;");
      console.log('\n👤 Current users:');
      console.table(users);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Authentication failed. Please check your username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create the database first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Please check if MySQL server is running and accessible.');
    }
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

checkDatabase();
