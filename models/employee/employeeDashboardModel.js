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
    const [[overdueTasks]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM task WHERE assignedTo = ? AND Task_status = 'overdue'`,
        [userId]
    )
    const [[pendingLeave]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM leave_request WHERE UserID = ? AND Leave_status = 'Pending'`,
        [userId]
    )
    return {
        activeTasks: activeTasks.count,
        overdueTasks: overdueTasks.count,
        pendingLeave: pendingLeave.count,
    }
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
