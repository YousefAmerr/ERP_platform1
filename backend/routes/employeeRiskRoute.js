import express from 'express';
import { manualTriggerTurnoverAnalysis } from '../controllers/employeeRiskController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/admin/predict-turnover
 * Manual trigger for turnover risk analysis
 * Requires: ADMIN role authentication
 */
router.post('/predict-turnover', requireAuth, async (req, res) => {
  // Check if user is ADMIN
  const userRole = req.user?.role?.toUpperCase();
  
  if (userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins can trigger turnover analysis.',
    });
  }

  // Call the controller
  return manualTriggerTurnoverAnalysis(req, res);
});

export default router;
