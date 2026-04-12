import pool from '../../config/database.js'

export async function getProjectById(projectId) {
    const [[row]] = await pool.execute(
        `SELECT ProjectID, projectName, projectDescription, Project_status FROM project WHERE ProjectID = ?`,
        [projectId]
    )
    return row || null
}

export async function getProjectTasks(projectId, filters = {}) {
    const params = [projectId]
    const conditions = []

    if (filters.employee) {
        conditions.push('t.assignedTo = ?')
        params.push(filters.employee)
    }
    if (filters.status) {
        conditions.push('t.Task_status = ?')
        params.push(filters.status)
    }

    const where = conditions.length ? 'AND ' + conditions.join(' AND ') : ''

    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.dueDate,
            t.Task_status,
            t.workLoadPoints,
            t.assignedTo,
            u.Name AS employeeName
         FROM task t
         LEFT JOIN users u ON u.UserID = t.assignedTo
         WHERE t.ProjectID = ?
         ${where}
         ORDER BY t.TaskID DESC`,
        params
    )
    return rows
}

export async function getProjectEmployees(projectId) {
    const [rows] = await pool.execute(
        `SELECT DISTINCT u.UserID, u.Name
         FROM task t
         JOIN users u ON u.UserID = t.assignedTo
         WHERE t.ProjectID = ?
         ORDER BY u.Name ASC`,
        [projectId]
    )
    return rows
}

export async function getAllEmployees() {
    const [rows] = await pool.execute(
        `SELECT UserID, Name FROM users WHERE role = 'EMPLOYEE' ORDER BY Name ASC`
    )
    return rows
}

export async function getUserIdByEmail(email) {
    const [[row]] = await pool.execute(
        `SELECT UserID FROM users WHERE email = ? LIMIT 1`,
        [email]
    )
    return row?.UserID || null
}

export async function insertTask(projectId, { title, description, assignedTo, dueDate, Task_status, workLoadPoints, AssignedBy }) {
    const [result] = await pool.execute(
        `INSERT INTO task (ProjectID, title, description, assignedTo, dueDate, Task_status, workLoadPoints, AssignedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, title, description || null, assignedTo, dueDate || null, Task_status || 'In_progress', workLoadPoints, AssignedBy]
    )
    return result.insertId
}

export async function updateTask(taskId, { title, description, assignedTo, dueDate, Task_status, workLoadPoints }) {
    await pool.execute(
        `UPDATE task SET title=?, description=?, assignedTo=?, dueDate=?, Task_status=?, workLoadPoints=?
         WHERE TaskID=?`,
        [title, description || null, assignedTo, dueDate || null, Task_status, workLoadPoints || null, taskId]
    )
}

export async function getDoneUnratedTasks(projectId, employeeFilter = null) {
    const params = [projectId]
    let empWhere = ''
    if (employeeFilter) {
        empWhere = 'AND t.assignedTo = ?'
        params.push(employeeFilter)
    }
    const [rows] = await pool.execute(
        `SELECT
            t.TaskID,
            t.title,
            t.dueDate,
            t.assignedTo,
            u.Name AS employeeName
         FROM task t
         LEFT JOIN users u ON u.UserID = t.assignedTo
         WHERE t.ProjectID = ?
           AND t.Task_status = 'done'
           AND (t.rating IS NULL OR t.rating = 0)
           ${empWhere}
         ORDER BY t.TaskID DESC`,
        params
    )
    return rows
}

export async function rateTask(taskId, { rating, ratingComment }) {
    await pool.execute(
        `UPDATE task SET rating = ?, ratingComment = ? WHERE TaskID = ?`,
        [rating, ratingComment || null, taskId]
    )
}
