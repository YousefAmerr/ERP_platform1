from flask import Flask, request, jsonify
import joblib
import pandas as pd
import traceback

# 1. Initialize the Flask App
app = Flask(__name__)

# 2. Load the "Brain" of your AI (Ensure these match the exact names from your training script)
try:
    model = joblib.load("node_turnover_model.pkl")
    scaler = joblib.load("node_turnover_scaler.pkl")
    print("AI Model and Scaler loaded successfully!")
except Exception as e:
    print(f"Error loading model files: {e}")

# 3. Create the API Route that Node.js will talk to
@app.route('/predict_turnover', methods=['POST'])
def predict_turnover():
    try:
        # A. Receive the JSON data sent from Node.js
        data = request.get_json()

        # B. Check if all required features are present
        required_features = ['task_completion_rate', 'overdue_rate', 'rating', 'leave_count']
        for feature in required_features:
            if feature not in data:
                return jsonify({"error": f"Missing required feature: {feature}"}), 400

        # C. Validate and convert data types
        try:
            task_completion_rate = float(data['task_completion_rate'])
            overdue_rate = float(data['overdue_rate'])
            rating = float(data['rating'])
            leave_count = int(data['leave_count'])
            
            # Validate ranges
            if not (0 <= task_completion_rate <= 1):
                return jsonify({"error": "task_completion_rate must be between 0 and 1"}), 400
            if not (0 <= overdue_rate <= 1):
                return jsonify({"error": "overdue_rate must be between 0 and 1"}), 400
            if not (1 <= rating <= 5):
                return jsonify({"error": "rating must be between 1 and 5"}), 400
            if leave_count < 0:
                return jsonify({"error": "leave_count must be non-negative"}), 400
        except (ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid data type: {str(e)}"}), 400

        # D. Format the data perfectly for the ML model
        input_data = pd.DataFrame([{
            "task_completion_rate": task_completion_rate,
            "overdue_rate": overdue_rate,
            "rating": rating,
            "leave_count": leave_count
        }])

        # E. Scale the data and Predict
        scaled_data = scaler.transform(input_data)
        prediction = model.predict(scaled_data)[0]
        
        # Optional: Get the exact percentage/probability of quitting (useful for dashboards)
        probability = model.predict_proba(scaled_data)[0][1]

        # F. Send the answer back to Node.js
        return jsonify({
            "Turnover_Prediction": int(prediction),
            "Risk_Probability": round(float(probability) * 100, 2)
        }), 200

    except Exception as e:
        # If something crashes, send the exact error back to Node.js so you can debug it
        error_msg = traceback.format_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e), "trace": error_msg}), 500

# 4. Start the Server
if __name__ == '__main__':
    # Runs on port 5000 so it doesn't clash with your Node.js server (which usually runs on 3000 or 8080)
    print("Starting ML API Server on Port 5000...")
    app.run(port=5000, debug=False, threaded=True)