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

export async function getActiveProjectsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM project WHERE Project_status = 'Active'`
    )
    return row.total
}

export async function getPendingLeaveCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM leave_request lr
         WHERE lr.Leave_status = 'Pending'
           AND (
             DATE_FORMAT(lr.startDate, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
             OR DATE_FORMAT(lr.endDate, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
           )`
    )
    return row.total
}

export async function getPendingLeaveList() {
    const [rows] = await pool.execute(
        `SELECT u.name, lr.startDate, lr.endDate, lr.type, lr.LeaveRequestID
         FROM leave_request lr
         JOIN users u ON lr.UserID = u.UserID
         WHERE lr.Leave_status = 'Pending'
           AND (
             DATE_FORMAT(lr.startDate, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
             OR DATE_FORMAT(lr.endDate, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
           )
         ORDER BY lr.startDate ASC
         LIMIT 11`
    )
    return rows
}

export async function getOpenAlertsList(limit = 20) {
        const [rows] = await pool.execute(
                `SELECT a.AlertID AS id, a.UserID as userId, u.Name as name, a.type, a.Alert_reason as reason, a.createdAt, a.Alert_status as status
                 FROM alert a
                 JOIN users u ON a.UserID = u.UserID
                 WHERE LOWER(a.Alert_status) = 'open' AND a.type IN ('Turnover','burnout')
                 ORDER BY a.createdAt DESC
                 LIMIT ?`,
                [limit]
        )
        return rows
}
