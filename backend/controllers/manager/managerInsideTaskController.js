import {
    getProjectById,
    getProjectTasks,
    getProjectEmployees,
    getAllEmployees,
    insertTask,
    updateTask,
    deleteTask,
    getUserIdByEmail,
    getDoneUnratedTasks,
    rateTask,
    getTaskAssignedTo,
} from '../../models/manager/managerInsideTaskModel.js'
import { maybeCreateNeedHelpAlert } from '../../services/alertRuleEngine.js'

export async function getProject(req, res) {
    const project = await getProjectById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ project })
}

export async function getTasks(req, res) {
    const { employee, status } = req.query
    const tasks = await getProjectTasks(req.params.id, { employee: employee || null, status: status || null })
    res.json({ tasks })
}

export async function getEmployees(req, res) {
    const [projectEmps, allEmps] = await Promise.all([
        getProjectEmployees(req.params.id),
        getAllEmployees(),
    ])
    res.json({ projectEmployees: projectEmps, allEmployees: allEmps })
}

export async function createTask(req, res) {
    const { title, description, assignedTo, dueDate, workLoadPoints } = req.body
    if (!title || !assignedTo || !workLoadPoints)
        return res.status(400).json({ message: 'title, assignedTo and workload are required' })
    const assignedBy = await getUserIdByEmail(req.user.email)
    if (!assignedBy) return res.status(400).json({ message: 'Manager account not found' })
    const attachmentPath = req.file ? req.file.filename : null
    const insertId = await insertTask(req.params.id, {
        title, description, assignedTo, dueDate,
        Task_status: 'In_progress',
        workLoadPoints,
        AssignedBy: assignedBy,
        attachmentPath,
    })
    res.status(201).json({ insertId })
}

export async function editTask(req, res) {
    const { title, description, assignedTo, dueDate, Task_status, workLoadPoints } = req.body
    if (!title || !assignedTo) return res.status(400).json({ message: 'title and assignedTo are required' })
    await updateTask(req.params.taskId, { title, description, assignedTo, dueDate, Task_status, workLoadPoints })
    res.json({ success: true })
}

export async function removeTask(req, res) {
    const affected = await deleteTask(req.params.taskId)
    if (!affected) return res.status(404).json({ message: 'Task not found' })
    res.json({ success: true })
}

export async function getDoneTasks(req, res) {
    const { employee } = req.query
    const tasks = await getDoneUnratedTasks(req.params.id, employee || null)
    res.json({ tasks })
}

export async function submitRating(req, res) {
    const { rating, ratingComment } = req.body
    if (!rating || rating < 1 || rating > 5)
        return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    await rateTask(req.params.taskId, { rating, ratingComment })
    res.json({ success: true })
    // Fire rule engine asynchronously — never blocks the response
    getTaskAssignedTo(req.params.taskId)
        .then((assignedTo) => assignedTo && maybeCreateNeedHelpAlert(assignedTo))
        .catch((err) => console.error('[RuleEngine]', err))
}
