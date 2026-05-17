import cron from 'node-cron';
import { analyzeTurnoverRisk } from '../controllers/employeeRiskController.js';

/**
 * Cron Job Scheduler for Automatic Turnover Risk Analysis
 * Runs on the 28th day of every month at midnight (00:00)
 * 
 * Cron Expression: 0 0 28 * * (minute hour day-of-month month day-of-week)
 * - 0 = At minute 0
 * - 0 = At hour 0 (midnight)
 * - 28 = On the 28th day of the month
 * - * = Every month
 * - * = Every day of week
 */
export function initTurnoverRiskScheduler() {
  try {
    const task = cron.schedule('0 0 28 * *', async () => {
      console.log('\n⏰ ========== SCHEDULED TURNOVER RISK ANALYSIS ==========');
      console.log(`📅 Execution Time: ${new Date().toLocaleString()}`);

      try {
        const result = await analyzeTurnoverRisk();
        console.log(
          `✅ Scheduled analysis completed successfully: ${result.processed} employees processed, ${result.flagged} flagged`
        );
      } catch (error) {
        console.error('❌ Scheduled analysis failed:', error.message);
      }

      console.log('========================================================\n');
    });

    // Mark task to not prevent process from exiting
    task.stop();
    task.start();

    console.log('✅ Turnover Risk Analysis scheduler initialized (runs on 28th at midnight)');
    return task;
  } catch (error) {
    console.error('❌ Failed to initialize turnover risk scheduler:', error.message);
    throw error;
  }
}

/**
 * Optional: Stop the scheduler (useful for graceful shutdown)
 */
export function stopTurnoverRiskScheduler(task) {
  if (task) {
    task.stop();
    console.log('🛑 Turnover risk scheduler stopped');
  }
}
