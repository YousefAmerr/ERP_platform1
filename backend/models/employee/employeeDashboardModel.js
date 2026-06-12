import pool from '../../config/database.js'

export async function getEmployeeIdByEmail(email) {
    const [[row]] = await pool.execute(
        `SELECT UserID FROM users WHERE email = ? LIMIT 1`,
        [email]
    )
    return row?.UserID || null
}

export async function getEmployeeDashboardStats(userId) {
    const [[activeTasks]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM task WHERE assignedTo = ? AND Task_status = 'In_progress'`,
        [userId]
    )
    const [[completedTasks]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM task WHERE assignedTo = ? AND Task_status = 'done'`,
        [userId]
    )
    // Currently overdue = still in progress AND past its due date (live, real-time)
    const [[overdueTasks]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM task
         WHERE assignedTo = ? AND Task_status = 'In_progress'
           AND dueDate IS NOT NULL AND dueDate < CURDATE()`,
        [userId]
    )
    const [[pendingLeave]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM leave_request WHERE UserID = ? AND Leave_status = 'Pending'`,
        [userId]
    )
    return {
        completedTasks: completedTasks.count,
        activeTasks: activeTasks.count,
        overdueTasks: overdueTasks.count,
        pendingLeave: pendingLeave.count,
    }
}

// Completed ('done') tasks grouped by month of the current year → bar chart.
// NOTE: the task table has no completion timestamp, so dueDate is used as the
// completion-month proxy (the only date available on a task).
export async function getEmployeeMonthlyCompleted(userId) {
    const [rows] = await pool.execute(
        `SELECT MONTH(dueDate) AS month, COUNT(*) AS count
         FROM task
         WHERE assignedTo = ?
           AND Task_status = 'done'
           AND dueDate IS NOT NULL
           AND YEAR(dueDate) = YEAR(CURDATE())
         GROUP BY MONTH(dueDate)
         ORDER BY MONTH(dueDate)`,
        [userId]
    )
    return rows.map((r) => ({ month: Number(r.month), count: Number(r.count) }))
}

// Active (In_progress) tasks across all projects → "Active Tasks Inbox" table.
export async function getEmployeeActiveTasks(userId) {
    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.dueDate,
            t.was_overdue,
            t.workLoadPoints,
            p.projectName
         FROM task t
         INNER JOIN project p ON p.ProjectID = t.ProjectID
         WHERE t.assignedTo = ? AND t.Task_status = 'In_progress'
         ORDER BY (t.dueDate IS NULL) ASC, t.dueDate ASC, t.TaskID DESC`,
        [userId]
    )
    return rows
}

export async function getEmployeeRatings(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM task
         WHERE assignedTo = ? AND rating IS NOT NULL AND rating > 0`,
        [userId]
    )

    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.rating,
            t.ratingComment,
            t.dueDate
         FROM task t
         WHERE t.assignedTo = ?
           AND t.rating IS NOT NULL
           AND t.rating > 0
         ORDER BY t.TaskID DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    )

    return { ratings: rows, total, page, limit }
}
