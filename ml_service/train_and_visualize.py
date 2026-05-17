import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# =========================
# 1. LOAD DATA
# =========================
# Load the newly named ML dataset
df = pd.read_csv('db_aligned_ml_data.csv')

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
print("Generating charts...")

# --- CHART 1: Confusion Matrix ---
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Stayed (0)', 'Quit (1)'], 
            yticklabels=['Stayed (0)', 'Quit (1)'])
plt.title('Turnover Prediction Confusion Matrix')
plt.xlabel('AI Predicted Outcome')
plt.ylabel('Actual Outcome')
plt.tight_layout()
plt.savefig("chart_1_confusion_matrix.png", dpi=300)
plt.close()

# --- CHART 2: Feature Importance ---
coefficients = model.coef_[0]
importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': coefficients
})
importance_df = importance_df.reindex(importance_df.Importance.abs().sort_values(ascending=False).index)

plt.figure(figsize=(8, 5))
sns.barplot(x='Importance', y='Feature', data=importance_df, palette='coolwarm')
plt.title('Drivers of Employee Turnover (Feature Importance)')
plt.xlabel('Impact on Turnover (Negative = Stays, Positive = Quits)')
plt.ylabel('HR Metric')
plt.tight_layout()
plt.savefig("chart_2_feature_importance.png", dpi=300)
plt.close()

print("Success! Saved charts to your folder.")