// db.js
import pkg from 'pg';
const { Client } = pkg;

// --- Configure connection ---
const client = new Client({
//First 2 should not change
  user: 'postgres',
  host: 'localhost',
  //Name of Database
  database: 'testDB',
  //Local password
  password: 'Sensei.monkey334',
  //Default port
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    const result = await client.query('SELECT name FROM users');
    const mail = await client.query('SELECT email FROM users');
    console.log('Names:');
    result.rows.forEach(row => console.log(' -', row.name));
    mail.rows.forEach(row => console.log(' -', row.email));
  } catch(error) {
    console.log('error')
  }
}
run();