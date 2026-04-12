import pool from '../../config/database.js'
import bcrypt from 'bcryptjs'

export async function getDirectoryUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const [rows] = await pool.execute(
        `SELECT UserID, Name, email, phone, role, active
         FROM users
         WHERE role IN ('EMPLOYEE','MANAGER')
         ORDER BY Name ASC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    )
    return rows
}

export async function getDirectoryUsersCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM users WHERE role IN ('EMPLOYEE','MANAGER')`
    )
    return row.total
}

export async function createUser(name, email, phone, plainPassword, role) {
    const hash = await bcrypt.hash(plainPassword, 10)
    const [result] = await pool.execute(
        `INSERT INTO users (Name, email, phone, password, role, active) VALUES (?,?,?,?,?,1)`,
        [name, email, phone || null, hash, role]
    )
    return result.insertId
}

export async function updateUser(userId, name, email, phone, role) {
    await pool.execute(
        `UPDATE users SET Name=?, email=?, phone=?, role=? WHERE UserID=?`,
        [name, email, phone || null, role, userId]
    )
}

export async function setUserActive(userId, active) {
    await pool.execute(
        `UPDATE users SET active=? WHERE UserID=?`,
        [active, userId]
    )
}

export async function deleteUserById(userId) {
    await pool.execute(`DELETE FROM users WHERE UserID=?`, [userId])
}

export async function emailExists(email, excludeUserId = null) {
    let sql = `SELECT COUNT(*) AS cnt FROM users WHERE email=?`
    const params = [email]
    if (excludeUserId) {
        sql += ` AND UserID != ?`
        params.push(excludeUserId)
    }
    const [[row]] = await pool.execute(sql, params)
    return row.cnt > 0
}
