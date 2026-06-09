import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import upload from '../../middlewares/uploadMiddleware.js'
import {
    getProject,
    getTasks,
    getEmployees,
    createTask,
    editTask,
    removeTask,
    getDoneTasks,
    submitRating,
} from '../../controllers/manager/managerInsideTaskController.js'

const router = Router()

router.get('/tasks/projects/:id',                        requireAuth, getProject)
router.get('/tasks/projects/:id/tasks',                  requireAuth, getTasks)
router.get('/tasks/projects/:id/employees',              requireAuth, getEmployees)
router.post('/tasks/projects/:id/tasks',                 requireAuth, upload.single('attachment'), createTask)
router.patch('/tasks/projects/:id/tasks/:taskId',        requireAuth, editTask)
router.delete('/tasks/projects/:id/tasks/:taskId',       requireAuth, removeTask)
router.get('/tasks/projects/:id/done-tasks',             requireAuth, getDoneTasks)
router.patch('/tasks/projects/:id/tasks/:taskId/rate',   requireAuth, submitRating)

export default router
