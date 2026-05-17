import pool from '../../config/database.js'

export async function getAllProjects() {
    const [rows] = await pool.execute(`
        SELECT
            p.ProjectID,
            p.projectName,
            p.projectDescription,
            p.Project_status,
            COUNT(t.TaskID)                                      AS totalTasks,
            SUM(t.Task_status = 'Done')                          AS completedTasks,
            SUM(t.Task_status != 'Done' AND t.Task_status IS NOT NULL) AS pendingTasks
        FROM project p
        LEFT JOIN task t ON t.ProjectID = p.ProjectID
        GROUP BY p.ProjectID
        ORDER BY p.ProjectID DESC
    `)
    return rows
}

export async function createProject(projectName, projectDescription, Project_status) {
    const [result] = await pool.execute(
        `INSERT INTO project (projectName, projectDescription, Project_status) VALUES (?, ?, ?)`,
        [projectName, projectDescription || null, Project_status]
    )
    return result.insertId
}

export async function updateProjectStatus(projectId, Project_status) {
    await pool.execute(
        `UPDATE project SET Project_status = ? WHERE ProjectID = ?`,
        [Project_status, projectId]
    )
}
