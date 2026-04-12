import pool from '../../config/database.js'

export async function getLeaveStatusCounts() {
    const [[pending]]  = await pool.execute(`SELECT COUNT(*) AS cnt FROM leave_request WHERE Leave_status='Pending'`)
    const [[approved]] = await pool.execute(`SELECT COUNT(*) AS cnt FROM leave_request WHERE Leave_status='approved'`)
    const [[rejected]] = await pool.execute(`SELECT COUNT(*) AS cnt FROM leave_request WHERE Leave_status='rejected'`)
    return {
        pending:  pending.cnt,
        approved: approved.cnt,
        rejected: rejected.cnt,
    }
}

export async function getLeaveRequests(page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const [rows] = await pool.execute(
        `SELECT lr.LeaveRequestID, lr.startDate, lr.endDate, lr.type,
                lr.Leave_reason, lr.Leave_status,
                u.Name AS employeeName, u.role AS employeeRole
         FROM leave_request lr
         JOIN users u ON lr.UserID = u.UserID
         ORDER BY lr.LeaveRequestID DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    )
    return rows
}

export async function getLeaveRequestsCount() {
    const [[row]] = await pool.execute(`SELECT COUNT(*) AS total FROM leave_request`)
    return row.total
}

export async function updateLeaveStatus(leaveRequestId, status) {
    await pool.execute(
        `UPDATE leave_request SET Leave_status=? WHERE LeaveRequestID=?`,
        [status, leaveRequestId]
    )
}
