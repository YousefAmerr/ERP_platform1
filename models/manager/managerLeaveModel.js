import pool from '../../config/database.js'

export async function getTeamLeaveRequests(page = 1, limit = 5, status = null) {
    const offset = (page - 1) * limit
    const params = []
    let where = ''

    if (status && status !== 'all') {
        where = 'WHERE lr.Leave_status = ?'
        params.push(status)
    }

    const [rows] = await pool.execute(
        `SELECT
            lr.LeaveRequestID,
            lr.startDate,
            lr.endDate,
            lr.type,
            lr.Leave_reason,
            lr.Leave_status,
            u.Name AS employeeName,
            u.role AS employeeRole
         FROM leave_request lr
         JOIN users u ON lr.UserID = u.UserID
         ${where}
         ORDER BY lr.LeaveRequestID DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    )
    return rows
}

export async function getTeamLeaveCount(status = null) {
    const params = []
    let where = ''

    if (status && status !== 'all') {
        where = 'WHERE Leave_status = ?'
        params.push(status)
    }

    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM leave_request ${where}`,
        params
    )
    return row.total
}
