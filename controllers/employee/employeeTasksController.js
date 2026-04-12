import { getEmployeeIdByEmail } from '../../models/employee/employeeDashboardModel.js'
import {
    getEmployeeProjects,
    getProjectTasksForEmployee,
    getProjectNameById,
    getTaskForEmployee,
    updateTaskStatus,
} from '../../models/employee/employeeTasksModel.js'

export async function getMyProjects(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const projects = await getEmployeeProjects(userId)
    res.json({ projects })
}

export async function getMyProjectTasks(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const projectId = parseInt(req.params.projectId)
    const projectName = await getProjectNameById(projectId)
    if (!projectName) return res.status(404).json({ message: 'Project not found' })
    const tasks = await getProjectTasksForEmployee(userId, projectId)
    res.json({ projectName, tasks })
}

export async function getMyTaskDetail(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const task = await getTaskForEmployee(userId, parseInt(req.params.taskId))
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ task })
}

export async function patchTaskStatus(req, res) {
    const userId = await getEmployeeIdByEmail(req.user.email)
    if (!userId) return res.status(404).json({ message: 'Employee not found' })
    const { status } = req.body
    const allowed = ['In_progress', 'done', 'overdue']
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' })
    }
    const affected = await updateTaskStatus(userId, parseInt(req.params.taskId), status)
    if (!affected) return res.status(404).json({ message: 'Task not found or not yours' })
    res.json({ message: 'Status updated' })
}
