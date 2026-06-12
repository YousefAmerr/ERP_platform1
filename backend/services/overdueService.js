import pool from '../config/database.js'
import { maybeCreateNeedHelpAlert } from './alertRuleEngine.js'

/**
 * Persist the "missed deadline" history flag.
 *
 * Any task that is still In_progress and whose dueDate has passed is permanently
 * marked was_overdue = 1. We capture the set of affected employees BEFORE the
 * update so we can run the Need Help rule engine for each of them afterwards
 * (a freshly-flagged late task can trip Trigger 1 — two consecutive late tasks).
 *
 * Returns { flaggedTasks, affectedEmployees }.
 */
export async function flagOverdueTasks() {
    // 1. Find employees who own at least one newly-overdue task
    const [affectedRows] = await pool.execute(
        `SELECT DISTINCT assignedTo AS userId
         FROM task
         WHERE Task_status = 'In_progress'
           AND was_overdue = 0
           AND dueDate IS NOT NULL
           AND dueDate < CURDATE()`
    )

    // 2. Flag them
    const [result] = await pool.execute(
        `UPDATE task
         SET was_overdue = 1
         WHERE Task_status = 'In_progress'
           AND was_overdue = 0
           AND dueDate IS NOT NULL
           AND dueDate < CURDATE()`
    )

    const affectedEmployees = affectedRows.map((r) => r.userId).filter(Boolean)

    // 3. Re-evaluate each affected employee against the Need Help rule engine
    for (const userId of affectedEmployees) {
        await maybeCreateNeedHelpAlert(userId).catch((err) =>
            console.error('[OverdueService] rule engine failed for', userId, err)
        )
    }

    return { flaggedTasks: result.affectedRows || 0, affectedEmployees: affectedEmployees.length }
}
