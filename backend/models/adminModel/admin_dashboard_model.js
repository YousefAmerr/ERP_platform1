import pool from '../../config/database.js'

export async function getTotalEmployees() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM users WHERE role='EMPLOYEE' AND active=1`
    )
    return row.total
}

export async function getTotalManagers() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM users WHERE role='MANAGER' AND active=1`
    )
    return row.total
}

export async function getOpenTasksCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM task WHERE Task_status='In_progress'`
    )
    return row.total
}

export async function getOverdueTasksCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM task WHERE Task_status='overdue'`
    )
    return row.total
}

export async function getNeedHelpAlertsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM alert WHERE type='burnout' AND Alert_status='Open'`
    )
    return row.total
}

export async function getRecognitionAlertsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM alert WHERE type='recognition' AND Alert_status='Open'`
    )
    return row.total
}

export async function getTurnoverAlertsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM alert WHERE type='Turnover' AND Alert_status='Open'`
    )
    return row.total
}

export async function getPendingLeaveCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM leave_request WHERE Leave_status='Pending'`
    )
    return row.total
}

export async function getPendingLeaveList() {
    const [rows] = await pool.execute(
        `SELECT u.name, lr.startDate, lr.endDate, lr.type, lr.Leave_status AS status, lr.LeaveRequestID
         FROM leave_request lr
         JOIN users u ON lr.UserID = u.UserID
         WHERE lr.Leave_status = 'Pending'
         ORDER BY lr.startDate ASC
         LIMIT 10`
    )
    return rows
}
