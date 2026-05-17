-- ============================================================
-- END-TO-END TESTING GUIDE: Employee Turnover Prediction
-- ============================================================
-- Current Date: May 15, 2026
-- Test Month: May 2026 (2026-05-01 to 2026-05-31)

-- ============================================================
-- STEP 1: INSERT TEST DATA
-- ============================================================

-- A. Insert 2 Test Employees
INSERT INTO users (name, email, password, role, active, created_at)
VALUES 
  ('John Failing Employee', 'john.failing@erp.local', 'hashed_password_123', 'EMPLOYEE', 1, NOW()),
  ('Jane Perfect Employee', 'jane.perfect@erp.local', 'hashed_password_456', 'EMPLOYEE', 1, NOW());

-- Get the inserted user IDs (you'll need these for the next queries)
-- SELECT id, name, email FROM users WHERE email IN ('john.failing@erp.local', 'jane.perfect@erp.local');

-- B. Insert Tasks for Employee 1 (TERRIBLE METRICS - Should be flagged)
--    Expected: 10 total tasks, 2 done, 5 overdue, rating 2.0
INSERT INTO task (assigned_to, task_name, Task_status, Task_date, rating, created_at)
VALUES 
  -- Replace USER_ID_1 with the actual ID from step A
  (USER_ID_1, 'High Priority Project - OVERDUE', 'overdue', '2026-05-05', 1.5, NOW()),
  (USER_ID_1, 'Client Presentation - OVERDUE', 'overdue', '2026-05-08', 1.0, NOW()),
  (USER_ID_1, 'Database Migration - OVERDUE', 'overdue', '2026-05-10', 2.0, NOW()),
  (USER_ID_1, 'API Development - OVERDUE', 'overdue', '2026-05-12', 1.5, NOW()),
  (USER_ID_1, 'Bug Fixes - OVERDUE', 'overdue', '2026-05-14', 2.0, NOW()),
  (USER_ID_1, 'Documentation Task - DONE', 'done', '2026-05-03', 2.5, NOW()),
  (USER_ID_1, 'Code Review - DONE', 'done', '2026-05-09', 2.0, NOW()),
  (USER_ID_1, 'Testing Sprint - In Progress', 'in_progress', '2026-05-11', NULL, NOW()),
  (USER_ID_1, 'QA Testing - In Progress', 'in_progress', '2026-05-13', NULL, NOW()),
  (USER_ID_1, 'Deployment Planning - In Progress', 'in_progress', '2026-05-15', NULL, NOW());

-- C. Insert Leaves for Employee 1 (HIGH LEAVE COUNT - 4 approved leaves in May)
INSERT INTO leave_request (user_id, leave_date, approval_status, created_at)
VALUES 
  (USER_ID_1, '2026-05-20', 'Approved', NOW()),
  (USER_ID_1, '2026-05-21', 'Approved', NOW()),
  (USER_ID_1, '2026-05-22', 'Approved', NOW()),
  (USER_ID_1, '2026-05-23', 'Approved', NOW());

-- Expected Results for Employee 1:
--   - Total Tasks: 10
--   - Done Tasks: 2
--   - Overdue Tasks: 5
--   - Average Rating (of done tasks): (2.5 + 2.0) / 2 = 2.25
--   - Leave Count: 4
--   - Task Completion Rate: 2/10 = 0.20
--   - Overdue Rate: 5/10 = 0.50
--   - Risk Score (Expected): HIGH → Should be FLAGGED (Turnover_Prediction = 1)

-- ============================================================

-- D. Insert Tasks for Employee 2 (PERFECT METRICS - Should NOT be flagged)
--    Expected: 10 total tasks, 10 done, 0 overdue, rating 5.0
INSERT INTO task (assigned_to, task_name, Task_status, Task_date, rating, created_at)
VALUES 
  -- Replace USER_ID_2 with the actual ID from step A
  (USER_ID_2, 'Sprint Planning - DONE', 'done', '2026-05-01', 5.0, NOW()),
  (USER_ID_2, 'Backend API Development - DONE', 'done', '2026-05-02', 5.0, NOW()),
  (USER_ID_2, 'Frontend UI Implementation - DONE', 'done', '2026-05-03', 5.0, NOW()),
  (USER_ID_2, 'Database Optimization - DONE', 'done', '2026-05-04', 5.0, NOW()),
  (USER_ID_2, 'Unit Testing - DONE', 'done', '2026-05-05', 5.0, NOW()),
  (USER_ID_2, 'Integration Testing - DONE', 'done', '2026-05-06', 5.0, NOW()),
  (USER_ID_2, 'Code Review & Refactor - DONE', 'done', '2026-05-07', 5.0, NOW()),
  (USER_ID_2, 'Documentation - DONE', 'done', '2026-05-08', 5.0, NOW()),
  (USER_ID_2, 'Performance Tuning - DONE', 'done', '2026-05-09', 5.0, NOW()),
  (USER_ID_2, 'Deployment & Monitoring - DONE', 'done', '2026-05-10', 5.0, NOW());

-- E. Insert Leaves for Employee 2 (NO LEAVES - 0 approved leaves in May)
--    (No insert needed - just has 0 leaves)

-- Expected Results for Employee 2:
--   - Total Tasks: 10
--   - Done Tasks: 10
--   - Overdue Tasks: 0
--   - Average Rating (of done tasks): (5.0 * 10) / 10 = 5.0
--   - Leave Count: 0
--   - Task Completion Rate: 10/10 = 1.00
--   - Overdue Rate: 0/10 = 0.00
--   - Risk Score (Expected): LOW → Should NOT be flagged (Turnover_Prediction = 0)

-- ============================================================
-- STEP 2: VERIFY TEST DATA WAS INSERTED CORRECTLY
-- ============================================================

-- Run this to verify employees were created
SELECT id, name, email, role FROM users WHERE email IN ('john.failing@erp.local', 'jane.perfect@erp.local');

-- Run this to verify tasks for Employee 1
SELECT COUNT(*) as total_tasks FROM task WHERE assigned_to = USER_ID_1;
SELECT Task_status, COUNT(*) as count FROM task WHERE assigned_to = USER_ID_1 GROUP BY Task_status;
SELECT AVG(rating) as avg_rating FROM task WHERE assigned_to = USER_ID_1 AND Task_status = 'done';

-- Run this to verify tasks for Employee 2
SELECT COUNT(*) as total_tasks FROM task WHERE assigned_to = USER_ID_2;
SELECT Task_status, COUNT(*) as count FROM task WHERE assigned_to = USER_ID_2 GROUP BY Task_status;

-- Run this to verify leaves
SELECT user_id, COUNT(*) as leave_count FROM leave_request WHERE approval_status = 'Approved' AND MONTH(leave_date) = 5 GROUP BY user_id;

-- ============================================================
-- STEP 5: VERIFY RESULTS (Run AFTER the API call)
-- ============================================================

-- Check if alerts were created
SELECT id, user_id, type, Alert_reason, Alert_status, risk_score, created_at 
FROM alert 
WHERE type = 'Turnover' 
ORDER BY created_at DESC 
LIMIT 5;

-- Specifically for our test employees (Employee 1 should have alert, Employee 2 should NOT)
SELECT a.id, a.user_id, u.name, a.type, a.Alert_status, a.risk_score 
FROM alert a
JOIN users u ON a.user_id = u.id
WHERE u.email IN ('john.failing@erp.local', 'jane.perfect@erp.local')
AND a.type = 'Turnover'
ORDER BY a.created_at DESC;

-- Check how many open turnover alerts per employee this month
SELECT u.name, COUNT(a.id) as open_alerts
FROM alert a
JOIN users u ON a.user_id = u.id
WHERE a.type = 'Turnover'
AND a.Alert_status = 'Open'
AND MONTH(a.created_at) = 5
AND YEAR(a.created_at) = 2026
GROUP BY a.user_id, u.name;
