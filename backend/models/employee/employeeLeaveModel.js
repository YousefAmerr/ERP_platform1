import pool from '../../config/database.js'

export async function submitLeaveRequest(userId, startDate, endDate, type, reason, attachmentPath = null) {
    const [result] = await pool.execute(
        `INSERT INTO leave_request (UserID, startDate, endDate, type, Leave_reason, Leave_status, leave_attachments_path)
         VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
        [userId, startDate, endDate, type, reason, attachmentPath]
    )
    return result.insertId
}

export async function getEmployeeLeaveRequests(userId, page = 1, limit = 10, month = null, year = null) {
    const offset = (page - 1) * limit
    const conditions = ['UserID = ?']
    const params = [userId]

    if (year) {
        conditions.push('YEAR(startDate) = ?')
        params.push(Number(year))
    }
    if (month) {
        conditions.push('MONTH(startDate) = ?')
        params.push(Number(month))
    }

    const where = 'WHERE ' + conditions.join(' AND ')

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM leave_request ${where}`,
        params
    )

    const [rows] = await pool.execute(
        `SELECT LeaveRequestID, startDate, endDate, type, Leave_reason, Leave_status, leave_attachments_path, created_at
         FROM leave_request
         ${where}
         ORDER BY
           CASE WHEN Leave_status = 'Pending' THEN 0 ELSE 1 END ASC,
           created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    )

    return { requests: rows, total, page, limit }
}

export async function getEmployeeLeaveYears(userId) {
    const [rows] = await pool.execute(
        `SELECT DISTINCT YEAR(startDate) AS yr
         FROM leave_request
         WHERE UserID = ?
         ORDER BY yr DESC`,
        [userId]
    )
    return rows.map(r => r.yr)
}
