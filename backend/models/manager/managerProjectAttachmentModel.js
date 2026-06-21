import pool from '../../config/database.js'

// Created lazily at server startup so no manual migration is needed.
export async function ensureProjectAttachmentTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS project_attachment (
            AttachmentID INT AUTO_INCREMENT PRIMARY KEY,
            ProjectID INT NOT NULL,
            filePath VARCHAR(255) NOT NULL,
            originalName VARCHAR(255) NOT NULL,
            uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_project_attachment_project (ProjectID)
        )
    `)
}

// Bulk-insert the multer files uploaded with a project.
export async function insertProjectAttachments(projectId, files = []) {
    if (!files.length) return
    const placeholders = files.map(() => '(?, ?, ?)').join(', ')
    const params = []
    files.forEach((f) => {
        params.push(projectId, f.filename, f.originalname)
    })
    await pool.execute(
        `INSERT INTO project_attachment (ProjectID, filePath, originalName) VALUES ${placeholders}`,
        params
    )
}

export async function getProjectAttachments(projectId) {
    const [rows] = await pool.execute(
        `SELECT AttachmentID, filePath, originalName, uploadedAt
         FROM project_attachment
         WHERE ProjectID = ?
         ORDER BY AttachmentID ASC`,
        [projectId]
    )
    return rows
}
