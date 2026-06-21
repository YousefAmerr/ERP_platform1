import axios from 'axios';
import pool from '../config/database.js';

const ML_SERVICE_URL = 'http://127.0.0.1:5000';
const MIN_TOTAL_TASKS = 5;
const ALERT_TYPE = 'Turnover';
const ALERT_STATUS_OPEN = 'Open';

function parseDate(value) {
  return value ? new Date(value) : null;
}

function safeNumber(value, fallback = 0) {
  return value === null || value === undefined || Number.isNaN(Number(value))
    ? fallback
    : Number(value);
}

/**
 * Turn the raw ML metrics into a plain-language reason a manager can act on.
 * Lists only the factors that are actually problematic, ordered by the model's
 * weighting (overdue 0.35 > completion 0.30 > rating 0.25 > leave 0.10).
 */
function buildTurnoverReason(payload, prediction) {
  const completionPct = Math.round(safeNumber(payload.task_completion_rate) * 100);
  const overduePct = Math.round(safeNumber(payload.overdue_rate) * 100);
  const rating = safeNumber(payload.rating, 3);
  const leaves = safeNumber(payload.leave_count, 0);
  const riskPct = Math.round(safeNumber(prediction.Risk_Probability));

  const factors = [];
  if (safeNumber(payload.overdue_rate) >= 0.2) {
    factors.push(`missed deadlines on ${overduePct}% of their tasks`);
  }
  if (safeNumber(payload.task_completion_rate) < 0.7) {
    factors.push(`low task completion (only ${completionPct}% finished)`);
  }
  if (rating < 3) {
    factors.push(`a below-average performance rating (${rating.toFixed(1)} out of 5)`);
  }
  if (leaves >= 3) {
    factors.push(`frequent time off (${leaves} approved leaves)`);
  }

  // Should always have at least one factor when flagged, but fall back to a
  // metrics summary just in case the combination was borderline.
  if (factors.length === 0) {
    factors.push(
      `${completionPct}% task completion`,
      `${overduePct}% of tasks overdue`,
      `an average rating of ${rating.toFixed(1)}/5`,
    );
  }

  const factorText =
    factors.length === 1
      ? factors[0]
      : `${factors.slice(0, -1).join(', ')} and ${factors[factors.length - 1]}`;

  let band = 'Elevated';
  if (riskPct >= 75) band = 'Critical';
  else if (riskPct >= 60) band = 'High';

  return `${band} turnover risk — ${riskPct}% likelihood of leaving. Main concerns: this employee has ${factorText}.`;
}

/**
 * Analyze turnover risk across all active employees with batch data retrieval.
 * This implementation avoids per-row queries and uses in-memory merging.
 */
export async function analyzeTurnoverRisk() {
  try {
    console.log('🔍 Starting Employee Turnover Risk Analysis...');

    const [employees] = await pool.execute(`
      SELECT UserID as id, Name as name, email
      FROM users
      WHERE active = 1 AND role = 'EMPLOYEE'
    `);

    if (!employees.length) {
      console.log('⚠️ No active employees found.');
      return { processed: 0, flagged: 0, createdAlerts: [] };
    }

    const employeeIds = employees.map((employee) => employee.id);
    const placeholderList = employeeIds.map(() => '?').join(', ');

    const [alertRows] = await pool.execute(
      `
      SELECT a.UserID as userId,
             a.Alert_status as lastTurnoverAlertStatus,
             a.createdAt as lastTurnoverAlertAt
      FROM alert a
      JOIN (
        SELECT UserID, MAX(createdAt) AS maxCreatedAt
        FROM alert
        WHERE type = ? AND UserID IN (${placeholderList})
        GROUP BY UserID
      ) latest
      ON a.UserID = latest.UserID
      AND a.createdAt = latest.maxCreatedAt
      WHERE a.type = ? AND a.UserID IN (${placeholderList})
    `,
      [ALERT_TYPE, ...employeeIds, ALERT_TYPE, ...employeeIds]
    );

    const alertMap = new Map(
      alertRows.map((row) => [
        row.userId,
        {
          lastTurnoverAlertAt: row.lastTurnoverAlertAt,
          lastTurnoverAlertStatus: row.lastTurnoverAlertStatus,
        },
      ])
    );

    const [taskRows] = await pool.execute(
      `
      SELECT assignedTo as userId,
             Task_status as taskStatus,
             was_overdue,
             dueDate,
             rating
      FROM task
      WHERE assignedTo IN (${placeholderList})
    `,
      [...employeeIds]
    );

    const [leaveRows] = await pool.execute(
      `
      SELECT UserID as userId,
             created_at
      FROM leave_request
      WHERE UserID IN (${placeholderList})
        AND LOWER(Leave_status) = 'approved'
    `,
      [...employeeIds]
    );

    const employeeAggregateMap = new Map();
    for (const employee of employees) {
      const alert = alertMap.get(employee.id);
      const hasOpenAlert = alert && String(alert.lastTurnoverAlertStatus || '').toLowerCase() === 'open';
      if (hasOpenAlert) {
        console.log(
          `⏭️ Skipping ${employee.name}: active open Turnover alert exists.`
        );
        continue;
      }

      employeeAggregateMap.set(employee.id, {
        ...employee,
        lastTurnoverAlertAt: alert?.lastTurnoverAlertAt || null,
        taskCount: 0,
        doneCount: 0,
        overdueCount: 0,
        resolvedCount: 0,
        ratingSum: 0,
        ratingCount: 0,
        leaveCount: 0,
      });
    }

    for (const row of taskRows) {
      const employee = employeeAggregateMap.get(row.userId);
      if (!employee) continue;

      const dueDate = parseDate(row.dueDate);
      const lastAlertAt = parseDate(employee.lastTurnoverAlertAt);
      if (lastAlertAt && (!dueDate || dueDate <= lastAlertAt)) continue;

      employee.taskCount += 1;
      const status = String(row.taskStatus || '').toLowerCase();
      const wasOverdue = Number(row.was_overdue) === 1;
      const isDone = status === 'done';
      if (isDone) employee.doneCount += 1;
      if (wasOverdue) employee.overdueCount += 1;
      // A task counts as "resolved/attempted" if it was completed or ever missed
      // its deadline (these can overlap when a task is completed late).
      if (isDone || wasOverdue) employee.resolvedCount += 1;

      if (row.rating !== null && row.rating !== undefined) {
        employee.ratingSum += Number(row.rating);
        employee.ratingCount += 1;
      }
    }

    for (const row of leaveRows) {
      const employee = employeeAggregateMap.get(row.userId);
      if (!employee) continue;

      const leaveCreatedAt = parseDate(row.created_at);
      const lastAlertAt = parseDate(employee.lastTurnoverAlertAt);
      if (lastAlertAt && (!leaveCreatedAt || leaveCreatedAt <= lastAlertAt)) continue;

      employee.leaveCount += 1;
    }

    const eligibleEmployees = Array.from(employeeAggregateMap.values()).filter(
      (employee) => {
        const freshTaskCount = employee.resolvedCount;
        if (freshTaskCount < MIN_TOTAL_TASKS) {
          console.log(
            `⏭️ Skipping ${employee.name}: only ${freshTaskCount} fresh done/overdue tasks since last alert.`
          );
          return false;
        }

        return true;
      }
    );

    if (!eligibleEmployees.length) {
      console.log('✅ No eligible employees after task-based freshness filtering.');
      return {
        processed: employees.length,
        flagged: 0,
        createdAlerts: [],
        skipped: employees.length,
      };
    }

    console.log(`📊 Eligible employees for ML batch: ${eligibleEmployees.length}`);

    const mlRequests = eligibleEmployees.map((employee) => {
      const taskCompletionRate = employee.taskCount
        ? employee.doneCount / employee.taskCount
        : 0;
      const overdueRate = employee.taskCount
        ? employee.overdueCount / employee.taskCount
        : 0;
      const avgRating = employee.ratingCount
        ? employee.ratingSum / employee.ratingCount
        : 3.0;

      const payload = {
        task_completion_rate: Number(taskCompletionRate.toFixed(2)),
        overdue_rate: Number(overdueRate.toFixed(2)),
        rating: Number(avgRating.toFixed(2)),
        leave_count: employee.leaveCount,
      };

      return axios
        .post(`${ML_SERVICE_URL}/predict_turnover`, payload, { timeout: 5000 })
        .then((response) => ({ employee, payload, prediction: response.data }))
        .catch((error) => ({ employee, payload, error }));
    });

    const mlResults = await Promise.all(mlRequests);

    const alertsToInsert = [];
    const createdAlerts = [];
    const now = new Date();

    for (const result of mlResults) {
      const { employee, payload, prediction, error } = result;
      if (error) {
        console.error(
          `⚠️ ML request failed for ${employee.name}:`,
          error.message || error
        );
        continue;
      }

      if (!prediction || prediction.Turnover_Prediction !== 1) {
        continue;
      }

      const alertReason = buildTurnoverReason(payload, prediction);
      alertsToInsert.push([employee.id, ALERT_TYPE, alertReason, ALERT_STATUS_OPEN]);
      createdAlerts.push({
        userId: employee.id,
        name: employee.name,
        email: employee.email,
        type: ALERT_TYPE,
        reason: alertReason,
        status: ALERT_STATUS_OPEN,
        riskProbability: prediction.Risk_Probability,
        taskCompletionRate: payload.task_completion_rate,
        overdueRate: payload.overdue_rate,
        rating: payload.rating,
        leaveCount: payload.leave_count,
        createdAt: now.toISOString(),
      });
    }

    if (alertsToInsert.length > 0) {
      const placeholders = alertsToInsert.map(() => '(?, ?, ?, ?, NOW())').join(', ');
      const insertParams = alertsToInsert.flat();
      await pool.execute(
        `INSERT INTO alert (UserID, type, Alert_reason, Alert_status, createdAt) VALUES ${placeholders}`,
        insertParams
      );
      console.log(`🚨 Bulk inserted ${alertsToInsert.length} new Turnover alert(s).`);
    }

    return {
      processed: eligibleEmployees.length,
      flagged: createdAlerts.length,
      createdAlerts,
      skipped: employees.length - eligibleEmployees.length,
    };
  } catch (error) {
    console.error('❌ Critical error in analyzeTurnoverRisk:', error);
    throw error;
  }
}

export async function manualTriggerTurnoverAnalysis(req, res) {
  try {
    const result = await analyzeTurnoverRisk();
    return res.status(200).json({
      success: true,
      message: 'Turnover risk analysis completed',
      data: result,
    });
  } catch (error) {
    console.error('Error in manual trigger:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run turnover analysis',
      error: error.message || 'Internal Server Error',
    });
  }
}
