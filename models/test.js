import pool from '../config/database.js'

export async function getDatabaseTableeee() {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}