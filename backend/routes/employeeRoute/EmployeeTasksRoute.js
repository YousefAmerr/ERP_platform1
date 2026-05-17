import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import {
    getMyProjects,
    getMyProjectTasks,
    getMyTaskDetail,
    patchTaskStatus,
} from '../../controllers/employee/employeeTasksController.js'

const router = Router()

router.get('/tasks/projects',                              requireAuth, getMyProjects)
router.get('/tasks/projects/:projectId/tasks',             requireAuth, getMyProjectTasks)
router.get('/tasks/projects/:projectId/tasks/:taskId',     requireAuth, getMyTaskDetail)
router.patch('/tasks/projects/:projectId/tasks/:taskId/status', requireAuth, patchTaskStatus)

export default router
