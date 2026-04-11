import mysql from 'mysql2'
import 'colors'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1'); // quick DB health check
    connection.release();

    console.log('MySQL database connected'.bgMagenta.white);
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
};

export {connectDB}
export default pool