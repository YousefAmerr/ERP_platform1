# 🧪 END-TO-END TESTING GUIDE: Employee Turnover Prediction System

**Current Date:** May 15, 2026  
**Test Scope:** Full pipeline from employee data → ML prediction → database alert

---

## 📋 STEP-BY-STEP TESTING PROCEDURE

### **STEP 1: Insert Test Data into MySQL**

#### 1A. First, get the actual User IDs

Open **phpMyAdmin** or **MySQL Workbench** and run:

```sql
-- Run this FIRST to get the IDs
INSERT INTO users (name, email, password, role, active, created_at)
VALUES
  ('John Failing Employee', 'john.failing@erp.local', '$2a$10$FakeHashedPassword123', 'EMPLOYEE', 1, NOW()),
  ('Jane Perfect Employee', 'jane.perfect@erp.local', '$2a$10$FakeHashedPassword456', 'EMPLOYEE', 1, NOW());

-- Then run this to see the IDs
SELECT id, name, email FROM users WHERE email IN ('john.failing@erp.local', 'jane.perfect@erp.local');
```

**You should see:**

```
id | name                  | email
1  | John Failing Employee | john.failing@erp.local
2  | Jane Perfect Employee | jane.perfect@erp.local
```

#### 1B. Insert Tasks and Leaves

Copy the ID numbers from above and replace `USER_ID_1` and `USER_ID_2` in the SQL file.

Use the complete SQL from `E2E_TEST_DATA.sql` file. It includes:

- **Employee 1 (ID=1):** 10 tasks (2 done, 5 overdue, 3 in_progress), Rating=2.25, 4 leaves
- **Employee 2 (ID=2):** 10 tasks (all done), Rating=5.0, 0 leaves

**Expected ML Predictions:**

- Employee 1: `Turnover_Prediction = 1` ✓ (Should get FLAGGED)
- Employee 2: `Turnover_Prediction = 0` ✓ (Should NOT get flagged)

#### 1C. Verify the data

```sql
-- Check task aggregation for Employee 1
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN Task_status = 'done' THEN 1 ELSE 0 END) as done,
  SUM(CASE WHEN Task_status = 'overdue' THEN 1 ELSE 0 END) as overdue,
  AVG(CASE WHEN Task_status = 'done' THEN rating END) as avg_rating
FROM task
WHERE assigned_to = 1;

-- Expected output: total=10, done=2, overdue=5, avg_rating≈2.25
```

---

### **STEP 2: Start the Flask ML Service (Port 5000)**

Open **Terminal 1** (PowerShell) and navigate to the ML service:

```powershell
cd C:\xampp\htdocs\ERP_PLATFORM_FYP1\ERP_platform1\ml_service

# Start the Flask server
python app.py
```

**Expected Output:**

```
AI Model and Scaler loaded successfully!
Starting ML API Server on Port 5000...
WARNING in app.run() This is a development server...
Running on http://127.0.0.1:5000
```

✅ **Leave this terminal running** (do not close it)

---

### **STEP 3: Start the Node.js Backend Server (Port 3000 or 8080)**

Open **Terminal 2** (PowerShell) and navigate to the backend:

```powershell
cd C:\xampp\htdocs\ERP_PLATFORM_FYP1\ERP_platform1\backend

# Install dependencies (if not already done)
npm install

# Start the Node.js server
npm start
# OR if npm start is not configured:
node server.js
```

**Expected Output:**

```
✅ Server running on port 3000
✅ Turnover Risk Analysis scheduler initialized (runs on 28th at midnight)
```

✅ **Leave this terminal running** (do not close it)

---

### **STEP 4: Trigger the Turnover Analysis via API**

Now use **Terminal 3** to send the API request.

#### **Option A: Using PowerShell (Windows)**

```powershell
# First, get an auth token (adjust URL if your login endpoint is different)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@erp.local","password":"your_admin_password"}'

$token = $loginResponse.token

# Now trigger the turnover analysis
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/predict-turnover" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"}

$response | ConvertTo-Json
```

#### **Option B: Using curl (if you have curl installed)**

```bash
# First, get an auth token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.local","password":"your_admin_password"}'

# Extract the token from response, then:
curl -X POST http://localhost:3000/api/admin/predict-turnover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### **Option C: Using Postman**

1. Create a new POST request to: `http://localhost:3000/api/admin/predict-turnover`
2. Go to **Auth** tab → Select **Bearer Token** → Paste your admin token
3. Click **Send**

**Expected Response:**

```json
{
  "success": true,
  "message": "Turnover risk analysis completed",
  "data": {
    "processed": 2,
    "flagged": 1
  }
}
```

**What's happening in the console:**

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

### **STEP 5: Verify Results in Database**

Go back to **phpMyAdmin/MySQL Workbench** and run:

```sql
-- Check all turnover alerts created
SELECT
  a.id,
  u.name,
  a.type,
  a.Alert_status,
  a.risk_score,
  a.Alert_reason,
  a.created_at
FROM alert a
JOIN users u ON a.user_id = u.id
WHERE u.email IN ('john.failing@erp.local', 'jane.perfect@erp.local')
AND a.type = 'Turnover'
ORDER BY a.created_at DESC;
```

**Expected Results:**

```
id | name                  | type     | Alert_status | risk_score | Alert_reason                    | created_at
1  | John Failing Employee | Turnover | Open         | 85.23      | AI predicted high flight risk... | 2026-05-15 14:32:15
```

**Key Assertions:**

- ✅ **Only 1 alert** created (for Employee 1, NOT Employee 2)
- ✅ Alert **type** = 'Turnover'
- ✅ Alert **status** = 'Open'
- ✅ **risk_score** > 50% (high risk)
- ✅ **Alert_reason** includes completion rate and overdue rate

---

### **STEP 6: Test Duplicate Prevention (Optional)**

To verify that re-running the analysis doesn't create duplicate alerts:

1. Wait 2 seconds
2. Run the **STEP 4** API call again
3. Check the database again

**Expected:**

- Still only **1 alert** in the database
- Console shows: `⏭️ Open Turnover alert already exists for John Failing Employee this month, skipping duplicate`

---

### **STEP 7: Test ML Service Failure Handling (Optional)**

To verify graceful degradation when Flask is down:

1. Stop the Flask server (Terminal 1: Ctrl+C)
2. Run the API call again (STEP 4)
3. Check the response and console

**Expected:**

```json
{
  "success": true,
  "message": "Turnover risk analysis completed",
  "data": {
    "processed": 2,
    "flagged": 1
  }
}
```

**Console shows:**

```
⚠️ ML Service unreachable for John Failing Employee: Cannot connect to http://127.0.0.1:5000
⚠️ ML Service unreachable for Jane Perfect Employee: Cannot connect to http://127.0.0.1:5000
✅ Analysis complete: 2 processed, 0 flagged for turnover risk
```

✅ **System doesn't crash** - it gracefully skips employees and continues

---

## ✅ SUCCESS CRITERIA CHECKLIST

| Test                               | Expected                | Status |
| ---------------------------------- | ----------------------- | ------ |
| Both services start without errors | Flask + Node.js running | ☐      |
| API call returns 200 OK            | `"success": true`       | ☐      |
| Processed count = 2                | Both employees checked  | ☐      |
| Flagged count = 1                  | Only Employee 1 flagged | ☐      |
| Alert created for Employee 1       | Risk score ~85%         | ☐      |
| No alert for Employee 2            | Clean employee record   | ☐      |
| No duplicate alerts on re-run      | Still 1 alert total     | ☐      |
| Graceful failure when Flask down   | No crash, clear errors  | ☐      |

---

## 🐛 TROUBLESHOOTING

### **Issue: "Cannot connect to http://127.0.0.1:5000"**

- ❌ Flask is not running
- ✅ Start Flask in Terminal 1

### **Issue: "401 Unauthorized" on API call**

- ❌ Token is invalid or admin is not authenticated
- ✅ Check the auth token is valid and user has ADMIN role

### **Issue: "0 employees processed"**

- ❌ No EMPLOYEE role users in database
- ✅ Check Step 1 - verify employees were inserted

### **Issue: "Alert created but risk_score is NULL"**

- ❌ ML service returned incomplete response
- ✅ Check Flask logs for errors

### **Issue: "Duplicate alerts created"**

- ❌ Previous alerts have different Alert_status (closed/resolved)
- ✅ Only 'Open' alerts are checked for duplicates

---

## 📊 EXPECTED DATA FLOW

```
┌─────────────────────────┐
│   MySQL Database        │
│ - 2 test employees      │
│ - 20 test tasks         │
│ - 4 test leaves         │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│     Node.js Backend (Port 3000)             │
│  POST /api/admin/predict-turnover           │
│  analyzeTurnoverRisk() fetches data          │
│  & aggregates metrics                       │
└────────────┬────────────────────────────────┘
             │
             ↓ (HTTP POST with features)
┌─────────────────────────────────────────────┐
│   Python Flask ML Service (Port 5000)       │
│   POST /predict_turnover                    │
│   Returns: Turnover_Prediction & Risk %     │
└────────────┬────────────────────────────────┘
             │
             ↓ (JSON response)
┌─────────────────────────────────────────────┐
│     Node.js Processes Prediction            │
│   If Turnover_Prediction = 1:               │
│   → Check for duplicate alerts              │
│   → Insert new alert if needed              │
└────────────┬────────────────────────────────┘
             │
             ↓ (INSERT query)
┌─────────────────────────────────────────────┐
│   MySQL Alert Table                         │
│   - Employee 1: Turnover Alert (OPEN)       │
│   - Employee 2: No alert                    │
└─────────────────────────────────────────────┘
```

---

**Good luck with your FYP demonstration! 🚀**
