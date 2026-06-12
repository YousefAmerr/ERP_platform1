import pool from '../../config/database.js'

export async function getEmployeeProjects(userId) {
    const [rows] = await pool.execute(
        `SELECT
            p.ProjectID,
            p.projectName,
            p.Project_status,
            MAX(t.dueDate) AS dueDate,
            COUNT(t.TaskID) AS myTasks,
            SUM(CASE WHEN t.Task_status = 'done' THEN 1 ELSE 0 END) AS completedTasks,
            SUM(CASE WHEN t.Task_status = 'In_progress' THEN 1 ELSE 0 END) AS pendingTasks
         FROM project p
         INNER JOIN task t ON t.ProjectID = p.ProjectID AND t.assignedTo = ?
         GROUP BY p.ProjectID, p.projectName, p.Project_status
         ORDER BY p.ProjectID DESC`,
        [userId]
    )
    return rows
}

export async function getProjectTasksForEmployee(userId, projectId) {
    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.description,
            t.dueDate,
            t.Task_status,
            t.was_overdue,
            t.workLoadPoints,
            t.attachmentPath,
            p.projectName
         FROM task t
         INNER JOIN project p ON p.ProjectID = t.ProjectID
         WHERE t.assignedTo = ? AND t.ProjectID = ?
         ORDER BY t.TaskID ASC`,
        [userId, projectId]
    )
    return rows
}

export async function getProjectNameById(projectId) {
    const [[row]] = await pool.execute(
        `SELECT projectName FROM project WHERE ProjectID = ? LIMIT 1`,
        [projectId]
    )
    return row?.projectName || null
}

export async function getTaskForEmployee(userId, taskId) {
    const [[row]] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.description,
            t.dueDate,
            t.Task_status,
            t.was_overdue,
            t.workLoadPoints,
            t.attachmentPath,
            p.ProjectID,
            p.projectName
         FROM task t
         INNER JOIN project p ON p.ProjectID = t.ProjectID
         WHERE t.TaskID = ? AND t.assignedTo = ?
         LIMIT 1`,
        [taskId, userId]
    )
    return row || null
}

export async function updateTaskStatus(userId, taskId, status) {
    // Preserve the late-history flag: once a task has passed its due date it is
    // permanently marked was_overdue = 1 (even if it is now being completed late).
    const [result] = await pool.execute(
        `UPDATE task
         SET Task_status = ?,
             was_overdue = (was_overdue OR (dueDate IS NOT NULL AND dueDate < CURDATE()))
         WHERE TaskID = ? AND assignedTo = ?`,
        [status, taskId, userId]
    )
    return result.affectedRows
}
