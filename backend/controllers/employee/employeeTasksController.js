import { getEmployeeIdByEmail } from '../../models/employee/employeeDashboardModel.js'
import {
    getEmployeeProjects,
    getProjectTasksForEmployee,
    getProjectMetaById,
    getTaskForEmployee,
    updateTaskStatus,
} from '../../models/employee/employeeTasksModel.js'
import { getProjectAttachments } from '../../models/manager/managerProjectAttachmentModel.js'
import { maybeCreateNeedHelpAlert } from '../../services/alertRuleEngine.js'

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
    const meta = await getProjectMetaById(projectId)
    if (!meta) return res.status(404).json({ message: 'Project not found' })
    const [tasks, attachments] = await Promise.all([
        getProjectTasksForEmployee(userId, projectId),
        getProjectAttachments(projectId),
    ])
    res.json({
        projectName: meta.projectName,
        projectDescription: meta.projectDescription,
        projectStatus: meta.Project_status,
        attachments,
        tasks,
    })
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
    // 'overdue' is no longer a settable status — lateness is tracked via was_overdue
    const allowed = ['In_progress', 'done']
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' })
    }
    const affected = await updateTaskStatus(userId, parseInt(req.params.taskId), status)
    if (!affected) return res.status(404).json({ message: 'Task not found or not yours' })
    res.json({ message: 'Status updated' })
    // Fire rule engine asynchronously — never blocks the response
    maybeCreateNeedHelpAlert(userId).catch((err) => console.error('[RuleEngine]', err))
}
