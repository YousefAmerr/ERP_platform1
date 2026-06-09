import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import { createLeave, getLeaves, getLeaveYears } from '../../controllers/employee/employeeLeaveController.js'
import leaveUpload from '../../middlewares/leaveUploadMiddleware.js'

const router = Router()

router.post('/leave',         requireAuth, leaveUpload.single('attachment'), createLeave)
router.get('/leave/years',    requireAuth, getLeaveYears)
router.get('/leave',          requireAuth, getLeaves)

export default router
