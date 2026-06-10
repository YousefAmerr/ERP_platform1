import {
    getEmployeeIdByEmail,
    getEmployeeDashboardStats,
    getEmployeeRatings,
    getEmployeeMonthlyCompleted,
    getEmployeeActiveTasks,
} from '../../models/employee/employeeDashboardModel.js'

export async function getDashboardStats(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const stats = await getEmployeeDashboardStats(userId)
    res.json({ stats })
}

export async function getRatings(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const data = await getEmployeeRatings(userId, page, limit)
    res.json(data)
}

// Monthly completed-tasks history (current year) → bar chart.
export async function getMonthlyCompleted(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const months = await getEmployeeMonthlyCompleted(userId)
    res.json({ months })
}

// Active (In_progress) tasks → inbox table.
export async function getActiveTasks(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const tasks = await getEmployeeActiveTasks(userId)
    res.json({ tasks })
}
