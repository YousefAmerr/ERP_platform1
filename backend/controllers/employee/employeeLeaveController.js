import {
    getEmployeeIdByEmail,
} from '../../models/employee/employeeDashboardModel.js'
import {
    submitLeaveRequest,
    getEmployeeLeaveRequests,
} from '../../models/employee/employeeLeaveModel.js'

export async function createLeave(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })

    const { startDate, endDate, type, reason } = req.body
    if (!startDate || !endDate || !type || !reason) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const id = await submitLeaveRequest(userId, startDate, endDate, type, reason)
    res.status(201).json({ message: 'Leave request submitted', id })
}

export async function getLeaves(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })

    const page = parseInt(req.query.page) || 1
    const data = await getEmployeeLeaveRequests(userId, page, 10)
    res.json(data)
}
