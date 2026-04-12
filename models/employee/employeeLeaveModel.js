import pool from '../../config/database.js'

export async function submitLeaveRequest(userId, startDate, endDate, type, reason) {
    const [result] = await pool.execute(
        `INSERT INTO leave_request (UserID, startDate, endDate, type, Leave_reason, Leave_status)
         VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [userId, startDate, endDate, type, reason]
    )
    return result.insertId
}

export async function getEmployeeLeaveRequests(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM leave_request WHERE UserID = ?`,
        [userId]
    )

    const [rows] = await pool.execute(
        `SELECT LeaveRequestID, startDate, endDate, type, Leave_reason, Leave_status, created_at
         FROM leave_request
         WHERE UserID = ?
         ORDER BY LeaveRequestID DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    )

    return { requests: rows, total, page, limit }
}
