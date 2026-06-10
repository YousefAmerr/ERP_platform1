import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import {
    getDashboardStats,
    getRatings,
    getMonthlyCompleted,
    getActiveTasks,
} from '../../controllers/employee/employeeDashboardController.js'

const router = Router()

router.get('/dashboard/stats',            requireAuth, getDashboardStats)
router.get('/dashboard/ratings',          requireAuth, getRatings)
router.get('/dashboard/monthly-completed', requireAuth, getMonthlyCompleted)
router.get('/dashboard/active-tasks',      requireAuth, getActiveTasks)

export default router
