import pool from '../config/database.js'
import bcrypt from 'bcryptjs';

export async function findUserByEmail(email){
    const sql = `SELECT EXISTS(
    SELECT 1
    FROM users
    WHERE email=? AND active=1
    ) AS canLogin
     `

    const [row] = await pool.execute(sql, [email]);
    return row[0].canLogin === 1;
}


export async function matchPassword(email, plainPassword){
    const sql = `
    SELECT password AS passwordHash
    FROM users
    WHERE email=? AND active=1
    LIMIT 1
    `
    const [rows] = await pool.execute(sql, [email])

    if(rows.length === 0){
        return false;
    }

    const passwordHash = rows[0].passwordHash

    if(!passwordHash){
        return false;
    }

    return bcrypt.compare(plainPassword, passwordHash)
}

export async function getUserInfo(email) {
    const sql = `
    SELECT name, email, role
    FROM users
    WHERE email=? AND active=1
    LIMIT 1
    `
    const [rows] = await pool.execute(sql, [email])
    return rows.length > 0 ? rows[0] : null;
}

export async function checkRole(email, role) {
    const sql=`
    SELECT role
    FROM users
    WHERE email=? AND active=1
    LIMIT 1
    `
    const [rows] = await pool.execute(sql, [email])

    if(rows.length === 0){
        return false;
    }

    const dbRole = String(rows[0].role || '').trim().toUpperCase();
    const inputRole = String(role || '').trim().toUpperCase();

    return dbRole === inputRole;
}
