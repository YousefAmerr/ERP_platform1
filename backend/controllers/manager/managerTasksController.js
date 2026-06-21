import { getAllProjects, createProject, updateProjectStatus } from '../../models/manager/managerTasksModel.js'
import { insertProjectAttachments } from '../../models/manager/managerProjectAttachmentModel.js'

export async function getProjects(req, res) {
    const projects = await getAllProjects()
    res.json({ projects })
}

export async function addProject(req, res) {
    const { projectName, projectDescription, Project_status } = req.body
    if (!projectName || !Project_status) {
        return res.status(400).json({ message: 'projectName and Project_status are required' })
    }
    const insertId = await createProject(projectName, projectDescription, Project_status)
    if (req.files && req.files.length) {
        await insertProjectAttachments(insertId, req.files)
    }
    res.status(201).json({ insertId })
}

export async function patchProjectStatus(req, res) {
    const { id } = req.params
    const { Project_status } = req.body
    if (!Project_status) {
        return res.status(400).json({ message: 'Project_status is required' })
    }
    await updateProjectStatus(id, Project_status)
    res.json({ success: true })
}
