import pool from '../config/database.js';

/**
 * Fetch all recognition alerts joined with user names, newest first
 */
export async function fetchAllRecognitions() {
  const sql = `
    SELECT a.AlertID as alertId,
           a.UserID as userId,
           a.Alert_reason as reason,
           a.createdAt as createdAt,
           u.Name as name
    FROM alert a
    JOIN users u ON a.UserID = u.UserID
    WHERE a.type = 'recognition'
    ORDER BY a.createdAt DESC
  `;

  const [rows] = await pool.execute(sql);
  return rows;
}

export default { fetchAllRecognitions };
