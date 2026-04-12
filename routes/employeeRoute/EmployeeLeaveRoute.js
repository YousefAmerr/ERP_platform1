import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import { createLeave, getLeaves } from '../../controllers/employee/employeeLeaveController.js'

const router = Router()

router.post('/leave',        requireAuth, createLeave)
router.get('/leave',         requireAuth, getLeaves)

export default router
