import express from 'express'
import { getLeaveStats, getLeaveList, approveLeave, rejectLeave } from '../../controllers/adminController/leaveManagementController.js'
import { requireAuth } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/leave/stats',           requireAuth, getLeaveStats)
router.get('/leave',                 requireAuth, getLeaveList)
router.patch('/leave/:id/approve',   requireAuth, approveLeave)
router.patch('/leave/:id/reject',    requireAuth, rejectLeave)

export default router
