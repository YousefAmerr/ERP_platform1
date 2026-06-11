import pool from '../../config/database.js'

const LIMIT = 10

export async function getNeedHelpAlerts(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const offset = (page - 1) * LIMIT

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) AS total FROM alert WHERE type = 'Need Help'`
        )

        const [rows] = await pool.execute(
            `SELECT a.AlertID, a.UserID AS userId, u.Name AS name, u.email,
                    a.Alert_reason AS reason, a.Alert_status AS status, a.createdAt
             FROM alert a
             JOIN users u ON u.UserID = a.UserID
             WHERE a.type = 'Need Help'
             ORDER BY FIELD(a.Alert_status, 'Open', 'acknowledged', 'resolved'),
                      a.createdAt DESC
             LIMIT ? OFFSET ?`,
            [LIMIT, offset]
        )

        res.json({
            alerts: rows,
            total: Number(total),
            page,
            totalPages: Math.max(1, Math.ceil(Number(total) / LIMIT)),
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch alerts' })
    }
}

export async function acknowledgeNeedHelpAlert(req, res) {
    try {
        const [result] = await pool.execute(
            `UPDATE alert SET Alert_status = 'acknowledged'
             WHERE AlertID = ? AND type = 'Need Help' AND Alert_status = 'Open'`,
            [req.params.id]
        )
        if (!result.affectedRows)
            return res.status(404).json({ message: 'Alert not found or already actioned' })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to acknowledge alert' })
    }
}

export async function resolveNeedHelpAlert(req, res) {
    try {
        const [result] = await pool.execute(
            `UPDATE alert SET Alert_status = 'resolved'
             WHERE AlertID = ? AND type = 'Need Help' AND Alert_status IN ('Open','acknowledged')`,
            [req.params.id]
        )
        if (!result.affectedRows)
            return res.status(404).json({ message: 'Alert not found or already resolved' })
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to resolve alert' })
    }
}
