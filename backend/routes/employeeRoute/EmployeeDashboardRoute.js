import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import {
    getDashboardStats,
    getRatings,
} from '../../controllers/employee/employeeDashboardController.js'

const router = Router()

router.get('/dashboard/stats',   requireAuth, getDashboardStats)
router.get('/dashboard/ratings', requireAuth, getRatings)

export default router
