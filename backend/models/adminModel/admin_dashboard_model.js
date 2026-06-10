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

/* ── Analytics (charts) ───────────────────────────────────── */

// Task status breakdown across all tasks → donut chart
export async function getTaskStatusBreakdown() {
    const [[row]] = await pool.execute(
        `SELECT
            SUM(Task_status = 'In_progress') AS inProgress,
            SUM(Task_status = 'done')        AS done,
            SUM(Task_status = 'overdue')     AS overdue
         FROM task`
    )
    return {
        inProgress: Number(row.inProgress) || 0,
        done: Number(row.done) || 0,
        overdue: Number(row.overdue) || 0,
    }
}

// Distinct active employees flagged with an open Turnover alert (AI flight risk)
export async function getAtRiskEmployeeCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(DISTINCT a.UserID) AS atRisk
         FROM alert a
         JOIN users u ON u.UserID = a.UserID
         WHERE a.type = 'Turnover'
           AND LOWER(a.Alert_status) = 'open'
           AND u.active = 1
           AND u.role = 'EMPLOYEE'`
    )
    return Number(row.atRisk) || 0
}

// Leave requests grouped by type → bar chart
export async function getLeaveByType() {
    const [rows] = await pool.execute(
        `SELECT type, COUNT(*) AS count
         FROM leave_request
         GROUP BY type
         ORDER BY count DESC`
    )
    return rows.map((r) => ({ type: r.type, count: Number(r.count) || 0 }))
}

// Active projects with task progress → project health table
export async function getActiveProjectsOverview() {
    const [rows] = await pool.execute(
        `SELECT
            p.ProjectID,
            p.projectName,
            p.Project_status,
            COUNT(t.TaskID)                       AS total,
            SUM(t.Task_status = 'done')           AS done,
            SUM(t.Task_status = 'overdue')        AS overdue,
            COUNT(DISTINCT t.assignedTo)          AS team
         FROM project p
         LEFT JOIN task t ON t.ProjectID = p.ProjectID
         WHERE p.Project_status = 'Active'
         GROUP BY p.ProjectID, p.projectName, p.Project_status
         ORDER BY p.ProjectID DESC`
    )
    return rows.map((r) => ({
        ProjectID: r.ProjectID,
        projectName: r.projectName,
        Project_status: r.Project_status,
        total: Number(r.total) || 0,
        done: Number(r.done) || 0,
        overdue: Number(r.overdue) || 0,
        team: Number(r.team) || 0,
    }))
}
