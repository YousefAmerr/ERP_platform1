import express from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import { getDashboardStats, getCompletedTasks } from '../../controllers/manager/managerDashboardController.js'

const router = express.Router()

router.get('/dashboard/stats',         requireAuth, getDashboardStats)
router.get('/dashboard/completed-tasks', requireAuth, getCompletedTasks)

export default router
