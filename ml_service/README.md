# ML Service (Python Flask API)

This directory contains the Machine Learning service for the ERP Platform. It provides AI-powered predictions and analytics through a Flask REST API.

## Directory Structure

```
ml_service/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── node_turnover_model.pkl     # Trained ML model (to be added)
├── node_turnover_scaler.pkl    # Feature scaler (to be added)
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation Steps

1. **Navigate to the ml_service directory:**
```bash
cd ml_service
```

2. **Create a virtual environment (recommended):**
```bash
python -m venv venv
# Activate virtual environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Add your trained models:**
- Place `node_turnover_model.pkl` in this directory
- Place `node_turnover_scaler.pkl` in this directory

## Running the Service

### Development Mode
```bash
python app.py
```

The API will start on `http://localhost:5000`

### Production Mode (using Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Check if the service and models are loaded
- **Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. Single Prediction
- **Endpoint:** `POST /predict`
- **Description:** Get prediction for a single record
- **Request Body:**
```json
{
  "features": [value1, value2, value3, ...]
}
```
- **Response:**
```json
{
  "prediction": 0 or 1,
  "confidence": 0.95,
  "probabilities": [0.05, 0.95]
}
```

### 3. Batch Prediction
- **Endpoint:** `POST /batch-predict`
- **Description:** Get predictions for multiple records
- **Request Body:**
```json
{
  "features": [
    [value1, value2, ...],
    [value1, value2, ...],
    ...
  ]
}
```
- **Response:**
```json
{
  "predictions": [0, 1, 0, ...],
  "probabilities": [[0.9, 0.1], [0.3, 0.7], ...]
}
```

## Integration with Backend

The Node.js backend can communicate with this ML service via HTTP requests:

```javascript
// Example: Node.js backend calling ML service
const axios = require('axios');

const mlServiceURL = 'http://localhost:5000';

async function predictTurnover(features) {
  try {
    const response = await axios.post(`${mlServiceURL}/predict`, {
      features: features
    });
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error);
  }
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
FLASK_ENV=development
FLASK_APP=app.py
PORT=5000
MODEL_PATH=./node_turnover_model.pkl
SCALER_PATH=./node_turnover_scaler.pkl
```

## Dependencies

- **Flask**: Web framework for Python
- **scikit-learn**: Machine learning library
- **numpy**: Numerical computing
- **pandas**: Data manipulation (if needed)
- **gunicorn**: WSGI HTTP Server for production

## Troubleshooting

### Models not loading?
- Ensure `node_turnover_model.pkl` and `node_turnover_scaler.pkl` exist
- Check file paths in `app.py`
- Verify pickle files are not corrupted

### Port already in use?
- Change PORT in `.env` file
- Or kill the process using port 5000:
  ```bash
  # On Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Dependencies not installing?
- Update pip: `pip install --upgrade pip`
- Create a fresh virtual environment
- Check Python version compatibility

## Notes

- The service should be running on a separate port from the backend (default: 5000)
- Ensure proper CORS configuration if calling from frontend
- For production, use environment variables for configuration
- Monitor logs for any prediction errors

## Future Enhancements

- Add more ML models
- Implement model versioning
- Add request validation
- Add comprehensive logging
- Add authentication/authorization
- Add metrics and monitoring
