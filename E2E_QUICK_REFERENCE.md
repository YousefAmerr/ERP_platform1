# 🚀 QUICK REFERENCE: Copy-Paste Commands for E2E Testing

## 1️⃣ SQL: Insert Test Data

### Insert 2 Test Employees
```sql
INSERT INTO users (name, email, password, role, active, created_at)
VALUES 
  ('John Failing Employee', 'john.failing@erp.local', '$2a$10$salthashedpassword123', 'EMPLOYEE', 1, NOW()),
  ('Jane Perfect Employee', 'jane.perfect@erp.local', '$2a$10$salthashedpassword456', 'EMPLOYEE', 1, NOW());
```

### Get Their IDs
```sql
SELECT id, name, email FROM users WHERE email IN ('john.failing@erp.local', 'jane.perfect@erp.local');
```
**Note the IDs - you'll need them for the next queries!**

### Insert Tasks for Employee 1 (Replace `1` with actual ID)
```sql
INSERT INTO task (assigned_to, task_name, Task_status, Task_date, rating, created_at)
VALUES 
  (1, 'Task 1 - OVERDUE', 'overdue', '2026-05-05', 1.5, NOW()),
  (1, 'Task 2 - OVERDUE', 'overdue', '2026-05-08', 1.0, NOW()),
  (1, 'Task 3 - OVERDUE', 'overdue', '2026-05-10', 2.0, NOW()),
  (1, 'Task 4 - OVERDUE', 'overdue', '2026-05-12', 1.5, NOW()),
  (1, 'Task 5 - OVERDUE', 'overdue', '2026-05-14', 2.0, NOW()),
  (1, 'Task 6 - DONE', 'done', '2026-05-03', 2.5, NOW()),
  (1, 'Task 7 - DONE', 'done', '2026-05-09', 2.0, NOW()),
  (1, 'Task 8 - In Progress', 'in_progress', '2026-05-11', NULL, NOW()),
  (1, 'Task 9 - In Progress', 'in_progress', '2026-05-13', NULL, NOW()),
  (1, 'Task 10 - In Progress', 'in_progress', '2026-05-15', NULL, NOW());
```

### Insert Leaves for Employee 1 (Replace `1` with actual ID)
```sql
INSERT INTO leave_request (user_id, leave_date, approval_status, created_at)
VALUES 
  (1, '2026-05-20', 'Approved', NOW()),
  (1, '2026-05-21', 'Approved', NOW()),
  (1, '2026-05-22', 'Approved', NOW()),
  (1, '2026-05-23', 'Approved', NOW());
```

### Insert Perfect Tasks for Employee 2 (Replace `2` with actual ID)
```sql
INSERT INTO task (assigned_to, task_name, Task_status, Task_date, rating, created_at)
VALUES 
  (2, 'Sprint Planning', 'done', '2026-05-01', 5.0, NOW()),
  (2, 'Backend API', 'done', '2026-05-02', 5.0, NOW()),
  (2, 'Frontend UI', 'done', '2026-05-03', 5.0, NOW()),
  (2, 'Database Optimization', 'done', '2026-05-04', 5.0, NOW()),
  (2, 'Unit Testing', 'done', '2026-05-05', 5.0, NOW()),
  (2, 'Integration Testing', 'done', '2026-05-06', 5.0, NOW()),
  (2, 'Code Review', 'done', '2026-05-07', 5.0, NOW()),
  (2, 'Documentation', 'done', '2026-05-08', 5.0, NOW()),
  (2, 'Performance Tuning', 'done', '2026-05-09', 5.0, NOW()),
  (2, 'Deployment', 'done', '2026-05-10', 5.0, NOW());
```

### Verify Test Data
```sql
-- Check Employee 1 metrics
SELECT 
  COUNT(*) as total_tasks,
  SUM(CASE WHEN Task_status = 'done' THEN 1 ELSE 0 END) as done_tasks,
  SUM(CASE WHEN Task_status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks,
  AVG(CASE WHEN Task_status = 'done' THEN rating END) as avg_rating
FROM task WHERE assigned_to = 1;

-- Expected: total_tasks=10, done_tasks=2, overdue_tasks=5, avg_rating~2.25

-- Check Employee 2 metrics
SELECT 
  COUNT(*) as total_tasks,
  SUM(CASE WHEN Task_status = 'done' THEN 1 ELSE 0 END) as done_tasks,
  AVG(rating) as avg_rating
FROM task WHERE assigned_to = 2;

-- Expected: total_tasks=10, done_tasks=10, avg_rating=5.0
```

---

## 2️⃣ Terminal Commands: Start Services

### Terminal 1: Start Flask (Port 5000)
```powershell
cd C:\xampp\htdocs\ERP_PLATFORM_FYP1\ERP_platform1\ml_service
python app.py
```

### Terminal 2: Start Node.js Backend (Port 3000)
```powershell
cd C:\xampp\htdocs\ERP_PLATFORM_FYP1\ERP_platform1\backend
npm install
npm start
```

---

## 3️⃣ Trigger API Call: Run Analysis

### Terminal 3: PowerShell Command

#### Get Auth Token (replace with your admin credentials)
```powershell
$body = @{
    email = "admin@erp.local"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = $loginResponse.token
Write-Host "Token: $token"
```

#### Trigger Turnover Analysis
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/predict-turnover" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"}

$response | ConvertTo-Json
```

### Alternative: curl Command
```bash
# Get token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@erp.local\",\"password\":\"admin123\"}"

# Copy the token from response, then:
curl -X POST http://localhost:3000/api/admin/predict-turnover \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4️⃣ Verification: Check Results

### Check Alert Table
```sql
SELECT 
  a.id,
  u.name,
  a.type,
  a.Alert_status,
  a.risk_score,
  a.created_at
FROM alert a
JOIN users u ON a.user_id = u.id
WHERE u.email IN ('john.failing@erp.local', 'jane.perfect@erp.local')
AND a.type = 'Turnover'
ORDER BY a.created_at DESC;
```

**Expected Result:**
- ✅ 1 row for John Failing Employee (Employee 1)
- ✅ 0 rows for Jane Perfect Employee (Employee 2)
- ✅ Alert_status = 'Open'
- ✅ risk_score > 50

### Check for Duplicates (Run twice, should still have 1)
```sql
SELECT COUNT(*) as total_alerts
FROM alert
WHERE type = 'Turnover'
AND Alert_status = 'Open'
AND MONTH(created_at) = 5
AND YEAR(created_at) = 2026
AND user_id = 1;
```

**Expected:** Still `1` (no duplicates created)

### Check All Recent Alerts
```sql
SELECT * FROM alert ORDER BY created_at DESC LIMIT 10;
```

---

## 🎯 Expected Console Output (Node.js)

```
🔍 Starting Employee Turnover Risk Analysis...
📊 Processing 2 employees...
👤 John Failing Employee: Tasks=10, Done=2, Overdue=5, Rating=2.25, Leaves=4
🤖 ML Prediction: Turnover=1, Risk=85.23%
🚨 Alert created for John Failing Employee
👤 Jane Perfect Employee: Tasks=10, Done=10, Overdue=0, Rating=5.0, Leaves=0
🤖 ML Prediction: Turnover=0, Risk=5.12%
✅ Analysis complete: 2 processed, 1 flagged for turnover risk
```

---

## 🎯 Expected Console Output (Flask)

```
AI Model and Scaler loaded successfully!
Starting ML API Server on Port 5000...
* Running on http://127.0.0.1:5000
* WARNING in app.run() This is a development server. Do not use it in production deployment.

[Employee 1 Request]
* POST /predict_turnover - 200 OK

[Employee 2 Request]
* POST /predict_turnover - 200 OK
```

---

## ✅ Final Checklist

- [ ] 2 employees inserted with test data
- [ ] Flask server started on Port 5000
- [ ] Node.js server started on Port 3000
- [ ] API call returns `"success": true` and `"flagged": 1`
- [ ] 1 alert created in database (Employee 1 only)
- [ ] Re-running doesn't create duplicate alert
- [ ] System handles Flask going offline gracefully

**All checked? You're ready for your FYP demo! 🚀**
