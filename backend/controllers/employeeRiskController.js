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
      if (status === 'done') employee.doneCount += 1;
      if (status === 'overdue') employee.overdueCount += 1;

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
        const freshTaskCount = employee.doneCount + employee.overdueCount;
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

      const alertReason = `AI predicted high flight risk (${prediction.Risk_Probability}% probability) based on metrics: ${payload.task_completion_rate} completion, ${payload.overdue_rate} overdue.`;
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
