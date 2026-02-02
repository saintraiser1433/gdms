const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function resetDatabase() {
  try {
    await client.connect();
    
    // Drop and recreate database
    await client.query('DROP DATABASE IF EXISTS gdms;');
    console.log('Dropped database gdms');
    
    await client.query('CREATE DATABASE gdms;');
    console.log('Created database gdms');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

resetDatabase();
