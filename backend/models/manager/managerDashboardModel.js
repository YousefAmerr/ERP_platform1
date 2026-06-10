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

// Active "Need Help" blockers only (not resolved) → drives the KPI card.
export async function getNeedHelpAlertsCount() {
    const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM alert
         WHERE type = 'Need Help' AND Alert_status <> 'resolved'`
    )
    return Number(row.total) || 0
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

// ── Analytics (charts) ───────────────────────────────────────────────────────

// Team task status breakdown → donut
export async function getTeamTaskStatus() {
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

// Average manager rating per employee → horizontal bar (performance).
// Managers rate completed tasks 1-5; this surfaces strong / weak performers.
export async function getPerformanceByEmployee() {
    const [rows] = await pool.execute(
        `SELECT
            u.Name AS name,
            u.email AS email,
            ROUND(AVG(t.rating), 2) AS avgRating,
            COUNT(t.rating) AS ratedTasks
         FROM task t
         JOIN users u ON u.UserID = t.assignedTo
         WHERE t.rating IS NOT NULL AND t.rating > 0
           AND u.role = 'EMPLOYEE' AND u.active = 1
         GROUP BY u.UserID, u.Name, u.email
         ORDER BY avgRating DESC`
    )
    return rows.map((r) => ({
        name: r.name,
        email: r.email || "",
        avgRating: Number(r.avgRating) || 0,
        ratedTasks: Number(r.ratedTasks) || 0,
    }))
}

// Task-status composition per active project → stacked bar (delivery health).
export async function getProjectStatusBreakdown() {
    const [rows] = await pool.execute(
        `SELECT
            p.projectName AS name,
            SUM(t.Task_status = 'In_progress') AS inProgress,
            SUM(t.Task_status = 'done')        AS done,
            SUM(t.Task_status = 'overdue')     AS overdue
         FROM project p
         LEFT JOIN task t ON t.ProjectID = p.ProjectID
         WHERE p.Project_status = 'Active'
         GROUP BY p.ProjectID, p.projectName
         ORDER BY p.ProjectID DESC`
    )
    return rows.map((r) => ({
        name: r.name,
        inProgress: Number(r.inProgress) || 0,
        done: Number(r.done) || 0,
        overdue: Number(r.overdue) || 0,
    }))
}

// Recent "Need Help" alerts (employee blockers) → actionable table
export async function getRecentNeedHelpAlerts(limit = 5) {
    const [rows] = await pool.execute(
        `SELECT a.AlertID, a.UserID AS userId, u.Name AS name, a.type,
                a.Alert_reason AS reason, a.Alert_status AS status, a.createdAt
         FROM alert a
         JOIN users u ON u.UserID = a.UserID
         WHERE a.type = 'Need Help'
         ORDER BY a.createdAt DESC
         LIMIT ?`,
        [limit]
    )
    return rows
}

// Performance vs Capacity → scatter (workload vs avg rating per employee)
export async function getCapacityPerformance() {
    const [rows] = await pool.execute(
        `SELECT
            u.UserID AS userId,
            u.Name AS name,
            COUNT(t.TaskID) AS totalTasks,
            ROUND(AVG(t.rating), 2) AS avgRating,
            COUNT(t.rating) AS ratedTasks
         FROM users u
         LEFT JOIN task t ON t.assignedTo = u.UserID
         WHERE u.role = 'EMPLOYEE' AND u.active = 1
         GROUP BY u.UserID, u.Name
         HAVING totalTasks > 0
         ORDER BY totalTasks DESC`
    )
    return rows.map((r) => ({
        userId: r.userId,
        name: r.name,
        totalTasks: Number(r.totalTasks) || 0,
        avgRating: r.avgRating != null ? Number(r.avgRating) : 0,
        ratedTasks: Number(r.ratedTasks) || 0,
    }))
}

// Resource utilization → heatmap cells (tasks per employee per project)
export async function getUtilizationMatrix() {
    const [rows] = await pool.execute(
        `SELECT
            t.assignedTo AS userId,
            u.Name AS employeeName,
            t.ProjectID AS projectId,
            p.projectName AS projectName,
            COUNT(*) AS count
         FROM task t
         JOIN users u ON u.UserID = t.assignedTo
         JOIN project p ON p.ProjectID = t.ProjectID
         WHERE u.role = 'EMPLOYEE' AND u.active = 1
         GROUP BY t.assignedTo, u.Name, t.ProjectID, p.projectName`
    )
    return rows.map((r) => ({
        userId: r.userId,
        employeeName: r.employeeName,
        projectId: r.projectId,
        projectName: r.projectName,
        count: Number(r.count) || 0,
    }))
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
