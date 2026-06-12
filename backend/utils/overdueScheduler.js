import cron from 'node-cron'
import { flagOverdueTasks } from '../services/overdueService.js'

/**
 * Daily Overdue-Flagging Scheduler
 *
 * Runs every day at 00:05 and marks any In_progress task whose due date has
 * passed with was_overdue = 1, then re-runs the Need Help rule engine for the
 * affected employees. This is what makes overdue detection automatic — a task
 * no longer needs anyone to open a page for it to be recognised as late.
 *
 * Cron Expression: 5 0 * * *  (at 00:05 every day)
 */
export function initOverdueScheduler() {
    try {
        const task = cron.schedule('5 0 * * *', async () => {
            console.log('\n⏰ ===== SCHEDULED OVERDUE FLAGGING =====')
            console.log(`📅 Execution Time: ${new Date().toLocaleString()}`)
            try {
                const result = await flagOverdueTasks()
                console.log(
                    `✅ Overdue flagging done: ${result.flaggedTasks} task(s) flagged across ${result.affectedEmployees} employee(s)`
                )
            } catch (error) {
                console.error('❌ Overdue flagging failed:', error.message)
            }
            console.log('==========================================\n')
        })

        task.stop()
        task.start()

        // Run once on startup so the data is consistent without waiting for midnight
        flagOverdueTasks()
            .then((r) =>
                console.log(
                    `✅ Startup overdue flagging: ${r.flaggedTasks} task(s) flagged across ${r.affectedEmployees} employee(s)`
                )
            )
            .catch((err) => console.error('❌ Startup overdue flagging failed:', err.message))

        console.log('✅ Overdue scheduler initialized (runs daily at 00:05)')
        return task
    } catch (error) {
        console.error('❌ Failed to initialize overdue scheduler:', error.message)
        throw error
    }
}

export function stopOverdueScheduler(task) {
    if (task) {
        task.stop()
        console.log('🛑 Overdue scheduler stopped')
    }
}
