import pool from '../config/database.js';

export async function getTurnoverAlerts(req, res) {
  try {
    const statusFilter = String(req.query.statuses || 'open,resolved')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const allowedStatuses = ['open', 'acknowledged', 'resolved'];
    const requestedStatuses = statusFilter.filter((status) =>
      allowedStatuses.includes(status)
    );
    const statusesToQuery = requestedStatuses.length
      ? requestedStatuses
      : allowedStatuses;

    const placeholders = statusesToQuery.map(() => '?').join(', ');
    const sql = `
      SELECT a.AlertID as id, a.UserID as userId, u.Name as name, u.email as email,
             a.type, a.Alert_reason as reason, a.createdAt, a.Alert_status as status
      FROM alert a
      JOIN users u ON a.UserID = u.UserID
      WHERE a.type = 'Turnover' AND LOWER(a.Alert_status) IN (${placeholders})
      ORDER BY FIELD(LOWER(a.Alert_status), 'open', 'acknowledged', 'resolved'), a.createdAt DESC
    `;
    const [rows] = await pool.execute(sql, statusesToQuery);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching open turnover alerts:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
}

export async function acknowledgeTurnoverAlert(req, res) {
  try {
    const alertId = req.params.id;

    // Mark as acknowledged
    const updateSQL = `
      UPDATE alert SET Alert_status = 'acknowledged' WHERE AlertID = ? AND type = 'Turnover' AND Alert_status = 'Open'
    `;
    const [result] = await pool.execute(updateSQL, [alertId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found or already closed' });
    }

    // Return updated list of open and resolved alerts
    return getTurnoverAlerts(req, res);
  } catch (err) {
    console.error('Error closing alert:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to close alert' });
  }
}

export default { getTurnoverAlerts, acknowledgeTurnoverAlert };
