import os
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_curve, auc, precision_recall_curve,
    precision_score, recall_score, f1_score,
)
from sklearn.calibration import calibration_curve

# =========================
# 1. LOAD DATA
# =========================
# Load the newly named ML dataset
df = pd.read_csv('db_aligned_ml_data.csv')
raw = pd.read_csv('db_aligned_raw_data.csv')   # used for the behaviour-profile chart

# Drop UserID (not a predictive feature) and set Turnover as the target
X = df.drop(columns=['UserID', 'Turnover'])
y = df['Turnover']
feature_names = X.columns

# =========================
# 2. SPLIT & SCALE
# =========================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# =========================
# 3. TRAIN MODEL
# =========================
model = LogisticRegression(random_state=42, class_weight='balanced')
model.fit(X_train_scaled, y_train)

# =========================
# 4. EVALUATE
# =========================
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]
accuracy = accuracy_score(y_test, y_pred)

print("===== FINAL DATABASE-ALIGNED MODEL EVALUATION =====")
print(f"Accuracy: {accuracy:.4f}\n")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the final .pkl files for Node.js API integration
joblib.dump(model, "node_turnover_model.pkl")
joblib.dump(scaler, "node_turnover_scaler.pkl")
print("Saved 'node_turnover_model.pkl' and 'node_turnover_scaler.pkl' for the Node.js backend.\n")

# =========================
# 5. GENERATE CHARTS FOR PRESENTATION
# =========================
# All charts are saved to ./presentation_charts/ with special "ML##_" names so
# they are easy to tell apart when building the poster / report.
print("Generating presentation charts...")

OUT = "presentation_charts"
os.makedirs(OUT, exist_ok=True)

sns.set_style("whitegrid")
plt.rcParams.update({
    "figure.dpi": 100,
    "savefig.dpi": 300,
    "font.size": 12,
    "axes.titlesize": 15,
    "axes.titleweight": "bold",
    "axes.labelsize": 12,
})

C_STAY = "#14b8a6"   # teal  — stayed
C_QUIT = "#e05252"   # red   — quit
C_MAIN = "#3776fd"   # blue  — primary
C_ACC  = "#f59e0b"   # amber — accent

FEATURES = list(feature_names)
PRETTY = {
    "task_completion_rate": "Task Completion Rate",
    "overdue_rate": "Overdue Rate",
    "rating": "Manager Rating",
    "leave_count": "Leave Count",
}
means = X.mean()

def save(fig, name):
    fig.tight_layout()
    path = os.path.join(OUT, name)
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)
    print(f"  saved {path}")


# ── CHART 1 — MODEL PERFORMANCE: Accuracy / Precision / Recall / F1 ──────────
# All four values are computed live by scikit-learn on the held-out test set —
# the same numbers printed in the classification report above. Nothing is
# hard-coded. Precision / Recall / F1 are for the 'Quit' class (label 1),
# which is the class the system is built to catch.
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

metric_names = ["Accuracy", "Precision", "Recall", "F1 Score"]
metric_vals = [accuracy, prec, rec, f1]
metric_cols = [C_MAIN, C_ACC, C_QUIT, "#8b5cf6"]

fig, ax = plt.subplots(figsize=(9, 6))
bars = ax.bar(metric_names, metric_vals, color=metric_cols, width=0.55)
for b, v in zip(bars, metric_vals):
    ax.text(b.get_x() + b.get_width() / 2, v + 0.02, f"{v:.2f}",
            ha="center", fontsize=17, fontweight="bold", color="#1f2a44")
ax.set_ylim(0, 1.08)
ax.set_ylabel("Score")
ax.set_title(f"Turnover Model Performance — Test Set (n={len(y_test)})")
ax.text(0.5, -0.1, "Precision / Recall / F1 measured on the 'Quit' class",
        transform=ax.transAxes, ha="center", fontsize=10, color="#6b7590")
save(fig, "final_chart_1_model_performance.png")


# ── CHART 2 — FEATURE IMPACT on the turnover prediction ──────────────────────
# The bars are the real trained coefficients of the Logistic Regression model
# (model.coef_), read straight from the model that the backend uses.
# Positive (red)  = higher value pushes the prediction toward QUIT.
# Negative (teal) = higher value pushes the prediction toward STAY.
coefs = model.coef_[0]
order = np.argsort(np.abs(coefs))[::-1]
imp_names = [PRETTY[FEATURES[i]] for i in order]
imp_vals = coefs[order]
imp_cols = [C_QUIT if v > 0 else C_STAY for v in imp_vals]

fig, ax = plt.subplots(figsize=(9, 5.5))
bars = ax.barh(imp_names[::-1], imp_vals[::-1], color=imp_cols[::-1], height=0.55)
for b, v in zip(bars, imp_vals[::-1]):
    ax.text(v + (0.05 if v >= 0 else -0.05), b.get_y() + b.get_height() / 2,
            f"{v:+.2f}", va="center", ha="left" if v >= 0 else "right",
            fontweight="bold", fontsize=13)
ax.axvline(0, color="#1f2a44", lw=1.2)
ax.set_title("Feature Impact on Turnover Prediction")
ax.set_xlabel("Model coefficient  (→ pushes toward QUIT   |   ← pushes toward STAY)")
lim = max(abs(imp_vals)) * 1.35
ax.set_xlim(-lim, lim)
save(fig, "final_chart_2_feature_impact.png")

print("\nSuccess! Saved both charts to ./presentation_charts/")



