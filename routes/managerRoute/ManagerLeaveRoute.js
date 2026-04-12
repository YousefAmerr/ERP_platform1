import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import { getLeaveList } from '../../controllers/manager/managerLeaveController.js'

const router = Router()

router.get('/leave', requireAuth, getLeaveList)

export default router
