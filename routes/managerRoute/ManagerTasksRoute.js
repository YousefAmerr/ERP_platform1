import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import { getProjects, addProject, patchProjectStatus } from '../../controllers/manager/managerTasksController.js'

const router = Router()

router.get('/tasks/projects', requireAuth, getProjects)
router.post('/tasks/projects', requireAuth, addProject)
router.patch('/tasks/projects/:id/status', requireAuth, patchProjectStatus)

export default router
