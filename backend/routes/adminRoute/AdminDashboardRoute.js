import express from 'express'
import { getDashboardStats } from '../../controllers/adminController/adminDashboardController.js'
import { requireAuth } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// GET /api/v1/admin/dashboard/stats
router.get('/dashboard/stats', requireAuth, getDashboardStats)

export default router
