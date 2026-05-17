/**
 * INTEGRATION GUIDE: Employee Turnover Risk Prediction System
 * 
 * This guide explains how to integrate the turnover risk analysis system
 * into your Express server. It includes:
 * 1. Manual API route for admins to trigger analysis
 * 2. Automatic cron job that runs on the 28th of every month
 */

/**
 * ===== STEP 1: Add dependencies =====
 * 
 * In your package.json, ensure you have:
 * - "axios": "^1.4.0" (for ML service HTTP calls)
 * - "node-cron": "^3.0.3" (for scheduling)
 * 
 * Install with:
 * npm install axios node-cron
 */

/**
 * ===== STEP 2: Import in server.js =====
 * 
 * Add these imports at the top of your server.js file:
 * 
 * import employeeRiskRoute from './routes/employeeRiskRoute.js';
 * import { initTurnoverRiskScheduler } from './utils/turnoverScheduler.js';
 */

/**
 * ===== STEP 3: Register the route =====
 * 
 * Add this line where you register other routes (e.g., after other admin routes):
 * 
 * app.use('/api/admin', employeeRiskRoute);
 * 
 * This makes the manual trigger endpoint available at:
 * POST /api/admin/predict-turnover
 */

/**
 * ===== STEP 4: Initialize the scheduler =====
 * 
 * In your server startup code (e.g., after all routes are registered):
 * 
 * // Initialize automatic turnover risk analysis (runs on 28th at midnight)
 * let turnoverScheduler;
 * try {
 *   turnoverScheduler = initTurnoverRiskScheduler();
 * } catch (error) {
 *   console.error('Failed to initialize turnover scheduler:', error.message);
 * }
 */

/**
 * ===== STEP 5 (Optional): Graceful shutdown =====
 * 
 * If your server has a shutdown handler, stop the scheduler:
 * 
 * process.on('SIGTERM', () => {
 *   stopTurnoverRiskScheduler(turnoverScheduler);
 *   // ... other cleanup code
 * });
 */

/**
 * ===== HOW IT WORKS =====
 * 
 * 1. MANUAL TRIGGER:
 *    - Admin calls: POST /api/admin/predict-turnover
 *    - Requires authentication and ADMIN role
 *    - Returns: { success, data: { processed, flagged } }
 * 
 * 2. AUTOMATIC TRIGGER:
 *    - Runs automatically on the 28th of every month at 00:00 (midnight)
 *    - Fetches all active employees with role 'EMPLOYEE'
 *    - For each employee, aggregates current month data:
 *      * Total tasks, done tasks, overdue tasks, average rating
 *      * Leave count
 *    - Calculates features:
 *      * task_completion_rate = done_tasks / total_tasks
 *      * overdue_rate = overdue_tasks / total_tasks
 *    - Sends to ML service: POST http://127.0.0.1:5000/predict_turnover
 *    - If Turnover_Prediction = 1, inserts alert record
 * 
 * 3. ALERT STRUCTURE:
 *    - type: 'Turnover'
 *    - Alert_reason: Includes AI confidence and metric breakdown
 *    - Alert_status: 'Open'
 *    - risk_score: ML probability percentage
 */

/**
 * ===== COMPLETE server.js EXAMPLE =====
 * 
 * import express from 'express';
 * import employeeRiskRoute from './routes/employeeRiskRoute.js';
 * import { initTurnoverRiskScheduler } from './utils/turnoverScheduler.js';
 * 
 * const app = express();
 * 
 * // Middleware
 * app.use(express.json());
 * 
 * // Routes
 * app.use('/api/admin', employeeRiskRoute);
 * // ... other routes
 * 
 * // Start scheduler
 * let turnoverScheduler;
 * try {
 *   turnoverScheduler = initTurnoverRiskScheduler();
 * } catch (error) {
 *   console.error('Scheduler init error:', error.message);
 * }
 * 
 * // Start server
 * const PORT = process.env.PORT || 3000;
 * app.listen(PORT, () => {
 *   console.log(`✅ Server running on port ${PORT}`);
 * });
 * 
 * // Graceful shutdown
 * process.on('SIGTERM', () => {
 *   console.log('SIGTERM received, shutting down gracefully...');
 *   turnoverScheduler?.stop();
 *   process.exit(0);
 * });
 */

export default {};
