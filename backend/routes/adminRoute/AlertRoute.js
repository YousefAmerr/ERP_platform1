import express from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import { getTurnoverAlerts, acknowledgeTurnoverAlert } from '../../controllers/alertController.js';

const router = express.Router();

// GET /api/admin/alerts/turnover
router.get('/alerts/turnover', requireAuth, async (req, res) => {
  const userRole = req.user?.role?.toUpperCase();
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  return getTurnoverAlerts(req, res);
});

// PATCH /api/admin/alerts/:id/close
router.patch('/alerts/:id/acknowledge', requireAuth, async (req, res) => {
  const userRole = req.user?.role?.toUpperCase();
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  return acknowledgeTurnoverAlert(req, res);
});

export default router;
