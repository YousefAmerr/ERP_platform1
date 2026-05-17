import { getTeamLeaveRequests, getTeamLeaveCount } from '../../models/manager/managerLeaveModel.js'

export async function getLeaveList(req, res) {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 5
    const status = req.query.status          || null

    const [rows, total] = await Promise.all([
        getTeamLeaveRequests(page, limit, status),
        getTeamLeaveCount(status),
    ])

    res.json({ rows, total, page, limit })
}
