import pool from '../../config/database.js'

// ── Stat cards ──────────────────────────────────────────────────────────────

export async function getTeamEmployeesCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM users WHERE role='EMPLOYEE' AND active=1`
    )
    return row.total
}

export async function getTeamTasksCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM task`
    )
    return row.total
}

export async function getOverdueTasksCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM task WHERE Task_status='overdue'`
    )
    return row.total
}

export async function getTeamAlertsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM alert WHERE Alert_status='Open'`
    )
    return row.total
}

export async function getLeaveRequestsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM leave_request WHERE Leave_status='Pending'`
    )
    return row.total
}

export async function getOpenProjectsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM project WHERE Project_status='Active'`
    )
    return row.total
}

// ── Recent Completed Tasks ───────────────────────────────────────────────────

export async function getRecentCompletedTasks(limit = 5) {
    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.description,
            t.rating,
            t.ratingComment,
            t.dueDate,
            p.ProjectName AS projectName,
            u.Name        AS employeeName
         FROM task t
         LEFT JOIN users   u ON u.UserID    = t.assignedTo
         LEFT JOIN project p ON p.ProjectID = t.ProjectID
         WHERE t.Task_status = 'Done'
         ORDER BY t.dueDate DESC
         LIMIT ?`,
        [limit]
    )
    return rows
}
