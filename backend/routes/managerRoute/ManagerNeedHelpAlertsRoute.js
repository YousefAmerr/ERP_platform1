import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware.js'
import {
    getNeedHelpAlerts,
    acknowledgeNeedHelpAlert,
    resolveNeedHelpAlert,
} from '../../controllers/manager/managerNeedHelpAlertsController.js'

const router = Router()

router.get('/alerts/need-help',            requireAuth, getNeedHelpAlerts)
router.patch('/alerts/:id/acknowledge',    requireAuth, acknowledgeNeedHelpAlert)
router.patch('/alerts/:id/resolve',        requireAuth, resolveNeedHelpAlert)

export default router
