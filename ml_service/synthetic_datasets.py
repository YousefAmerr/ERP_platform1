import numpy as np
import pandas as pd

# Set seed for perfect reproducibility
np.random.seed(42)

N_ROWS = 1000
raw_rows = []
final_rows = []

def clamp(value, low, high):
    return max(low, min(high, value))

# Using 'UserID' instead of 'employee_id' to match the database
for UserID in range(1, N_ROWS + 1):
    
    # 1. Assign Personas
    profile = np.random.choice(
        ["stable", "pressured", "declining", "high_risk"],
        p=[0.35, 0.25, 0.25, 0.15]
    )

    # 2. Generate RAW Operational Data
    total_tasks = np.random.randint(6, 21)

    if profile == "stable":
        done_tasks = np.random.randint(int(total_tasks * 0.75), total_tasks + 1)
        overdue_tasks = np.random.randint(0, max(1, int(total_tasks * 0.10) + 1))
        leave_count = np.random.randint(0, 3)
    elif profile == "pressured":
        done_tasks = np.random.randint(int(total_tasks * 0.55), int(total_tasks * 0.85) + 1)
        overdue_tasks = np.random.randint(int(total_tasks * 0.05), int(total_tasks * 0.25) + 1)
        leave_count = np.random.randint(0, 3)
    elif profile == "declining":
        done_tasks = np.random.randint(int(total_tasks * 0.30), int(total_tasks * 0.65) + 1)
        overdue_tasks = np.random.randint(int(total_tasks * 0.15), int(total_tasks * 0.40) + 1)
        leave_count = np.random.randint(1, 5)
    else:  # high_risk
        done_tasks = np.random.randint(int(total_tasks * 0.10), int(total_tasks * 0.45) + 1)
        overdue_tasks = np.random.randint(int(total_tasks * 0.25), int(total_tasks * 0.60) + 1)
        leave_count = np.random.randint(2, 6)

    # Sanity check for tasks
    if done_tasks + overdue_tasks > total_tasks:
        overdue_tasks = max(0, total_tasks - done_tasks)
        
    # Matching exact 'In_progress' enum from Task_status
    In_progress_tasks = total_tasks - done_tasks - overdue_tasks

    # 3. FEATURE ENGINEERING (Simulating the Node.js Backend)
    task_completion_rate = done_tasks / total_tasks
    overdue_rate = overdue_tasks / total_tasks

    rating_base = 4.8 - (2.0 * overdue_rate) - (1.5 * (1 - task_completion_rate))
    
    # Matching exact 'rating' column from the task table
    rating = clamp(rating_base + np.random.normal(0, 0.25), 1.0, 5.0)

    normalized_low_rating = (5 - rating) / 4
    normalized_leave = min(leave_count, 5) / 5

    # 4. Calculate Risk Score (Workload removed per Supervisor's instruction)
    risk_score = (
        0.40 * (1 - task_completion_rate) +
        0.35 * overdue_rate +
        0.15 * normalized_low_rating +
        0.10 * normalized_leave
    )

    # 5. Probabilistic Assignment (Matching the 'Turnover' enum in the alert table)
    prob_roll = np.random.rand()
    if prob_roll < risk_score:
        Turnover = 1
    else:
        Turnover = 0

    # 6. Apply 5% Human Chaos / Noise
    if np.random.rand() < 0.05:
        Turnover = 1 - Turnover  # Flips 1 to 0, or 0 to 1

    # 7. Save to RAW List (Your Database Audit Trail)
    raw_rows.append({
        "UserID": UserID,
        "profile": profile,
        "total_tasks": total_tasks,
        "done_tasks": done_tasks,
        "overdue_tasks": overdue_tasks,
        "In_progress_tasks": In_progress_tasks,
        "leave_count": leave_count,
        "rating": round(rating, 2),
        "Turnover": Turnover 
    })

    # 8. Save to FINAL List (For Machine Learning Training)
    final_rows.append({
        "UserID": UserID,
        "task_completion_rate": round(task_completion_rate, 2),
        "overdue_rate": round(overdue_rate, 2),
        "rating": round(rating, 2),
        "leave_count": leave_count,
        "Turnover": Turnover
    })

# Save to CSV files
df_raw = pd.DataFrame(raw_rows)
df_final = pd.DataFrame(final_rows)

df_raw.to_csv("db_aligned_raw_data.csv", index=False)
df_final.to_csv("db_aligned_ml_data.csv", index=False)

print("Success! Generated 'db_aligned_raw_data.csv' and 'db_aligned_ml_data.csv'.")