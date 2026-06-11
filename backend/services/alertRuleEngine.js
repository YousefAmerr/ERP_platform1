import pool from '../config/database.js'

// ── DB reads for each trigger ─────────────────────────────────────────────────

async function getLastTwoTasks(userId) {
    const [rows] = await pool.execute(
        `SELECT Task_status FROM task WHERE assignedTo = ? ORDER BY TaskID DESC LIMIT 2`,
        [userId]
    )
    return rows
}

async function getLastThreeRatedTasks(userId) {
    const [rows] = await pool.execute(
        `SELECT rating FROM task
         WHERE assignedTo = ? AND Task_status = 'done'
           AND rating IS NOT NULL AND rating > 0
         ORDER BY TaskID DESC LIMIT 3`,
        [userId]
    )
    return rows
}

async function getCapacityData(userId) {
    const [[{ cnt }]] = await pool.execute(
        `SELECT COUNT(*) AS cnt FROM task WHERE assignedTo = ? AND Task_status = 'In_progress'`,
        [userId]
    )
    const [lastDone] = await pool.execute(
        `SELECT dueDate FROM task WHERE assignedTo = ? AND Task_status = 'done'
         ORDER BY TaskID DESC LIMIT 1`,
        [userId]
    )
    return { inProgressCount: Number(cnt), lastDoneDate: lastDone[0]?.dueDate || null }
}

async function hasActiveAlert(userId) {
    const [[row]] = await pool.execute(
        `SELECT AlertID FROM alert
         WHERE UserID = ? AND type = 'Need Help' AND Alert_status IN ('Open','acknowledged')
         LIMIT 1`,
        [userId]
    )
    return !!row
}

async function insertAlert(userId, reason) {
    await pool.execute(
        `INSERT INTO alert (UserID, type, Alert_reason, Alert_status)
         VALUES (?, 'Need Help', ?, 'Open')`,
        [userId, reason]
    )
}

// ── Trigger evaluation ────────────────────────────────────────────────────────

export async function evaluateEmployee(userId) {
    // T1 — Deadline Risk: last 2 assigned tasks are both overdue
    const lastTwo = await getLastTwoTasks(userId)
    if (lastTwo.length === 2 && lastTwo.every((t) => t.Task_status === 'overdue')) {
        return { triggered: true, reason: 'Deadline Risk: 2 consecutive tasks are overdue' }
    }

    // T2 — Quality Alert: most recent rating ≤ 2.0, OR avg of last 3 rated tasks < 3.0
    const ratedTasks = await getLastThreeRatedTasks(userId)
    if (ratedTasks.length > 0) {
        const mostRecent = Number(ratedTasks[0].rating)
        if (mostRecent <= 2) {
            return {
                triggered: true,
                reason: `Quality Alert: Most recent task rating is ${mostRecent}/5`,
            }
        }
        if (ratedTasks.length >= 3) {
            const avg = ratedTasks.reduce((s, t) => s + Number(t.rating), 0) / ratedTasks.length
            if (avg < 3.0) {
                return {
                    triggered: true,
                    reason: `Quality Alert: Average rating on last 3 tasks is ${avg.toFixed(1)}/5`,
                }
            }
        }
    }

    // T3 — Capacity Alert: >5 in-progress tasks AND no completion in last 7 days
    const { inProgressCount, lastDoneDate } = await getCapacityData(userId)
    if (inProgressCount > 5) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const overloaded = !lastDoneDate || new Date(lastDoneDate) < sevenDaysAgo
        if (overloaded) {
            return {
                triggered: true,
                reason: `Capacity Alert: ${inProgressCount} active tasks with no completion in over 7 days`,
            }
        }
    }

    return { triggered: false }
}

// ── Public entry-point ────────────────────────────────────────────────────────
// Call this fire-and-forget after any task status change or new rating.
// It silently skips if a live alert already exists for the employee.

export async function maybeCreateNeedHelpAlert(userId) {
    const result = await evaluateEmployee(userId)
    if (!result.triggered) return

    const alreadyOpen = await hasActiveAlert(userId)
    if (alreadyOpen) return

    await insertAlert(userId, result.reason)
    console.log(`[RuleEngine] Alert created → userId=${userId} | ${result.reason}`)
}
