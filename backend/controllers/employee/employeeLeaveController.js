import {
    getEmployeeIdByEmail,
} from '../../models/employee/employeeDashboardModel.js'
import {
    submitLeaveRequest,
    getEmployeeLeaveRequests,
    getEmployeeLeaveYears,
} from '../../models/employee/employeeLeaveModel.js'

export async function createLeave(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })

    const { startDate, endDate, type, reason } = req.body
    if (!startDate || !endDate || !type || !reason) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const attachmentPath = req.file ? req.file.filename : null
    const id = await submitLeaveRequest(userId, startDate, endDate, type, reason, attachmentPath)
    res.status(201).json({ message: 'Leave request submitted', id })
}

export async function getLeaves(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })

    const page = parseInt(req.query.page) || 1
    const month = req.query.month ? parseInt(req.query.month) : null
    const year  = req.query.year  ? parseInt(req.query.year)  : null
    const data = await getEmployeeLeaveRequests(userId, page, 10, month, year)
    res.json(data)
}

export async function getLeaveYears(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const years = await getEmployeeLeaveYears(userId)
    res.json({ years })
}
