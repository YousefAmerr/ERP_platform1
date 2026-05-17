# ERP Platform - Project Structure

This is a full-stack ERP (Enterprise Resource Planning) platform with separate frontend, backend, and ML service components.

## 📁 Project Structure

```
ERP_PLATFORM_FYP1/
│
├── frontend/               <-- React.js / Vite Frontend
│   ├── src/               # React components, pages, hooks
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── index.html         # Entry HTML file
│   ├── README.md          # Frontend documentation
│   └── ...
│
├── backend/               <-- Node.js / Express Backend
│   ├── controllers/       # Request handlers for different modules
│   │   ├── adminController/
│   │   ├── employee/
│   │   └── manager/
│   ├── models/            # Database models
│   │   ├── adminModel/
│   │   ├── employee/
│   │   └── manager/
│   ├── routes/            # API route definitions
│   │   ├── adminRoute/
│   │   ├── employeeRoute/
│   │   └── managerRoute/
│   ├── middlewares/       # Authentication, logging, etc.
│   ├── config/            # Database configuration
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server entry point
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
│
├── ml_service/            <-- Python Flask ML API
│   ├── app.py             # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── node_turnover_model.pkl      # Trained model
│   ├── node_turnover_scaler.pkl     # Feature scaler
│   ├── .env.example       # Environment variables template
│   ├── README.md          # ML service documentation
│   └── .gitignore         # Python-specific gitignore
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js & npm (for frontend & backend)
- Python 3.8+ (for ML service)
- Database (MySQL/PostgreSQL - configured in backend)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Access:** http://localhost:5173 (Vite default)

### Backend Setup
```bash
cd backend
npm install
npm start
```
**Server runs on:** http://localhost:3000 or 8080 (check server.js)

### ML Service Setup
```bash
cd ml_service
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
**API runs on:** http://localhost:5000

## 📚 Module Organization

### Admin Module
- **Route:** `backend/routes/adminRoute/`
- **Controller:** `backend/controllers/adminController/`
- **Models:** `backend/models/adminModel/`
- **Features:** Dashboard, User Management, Leave Management

### Employee Module
- **Route:** `backend/routes/employeeRoute/`
- **Controller:** `backend/controllers/employee/`
- **Models:** `backend/models/employee/`
- **Features:** Dashboard, Leave Requests, Task Management

### Manager Module
- **Route:** `backend/routes/managerRoute/`
- **Controller:** `backend/controllers/manager/`
- **Models:** `backend/models/manager/`
- **Features:** Dashboard, Task Management, Leave Approval

## 🔐 Authentication
- Authentication handled by `backend/middlewares/authMiddleware.js`
- User management in `backend/controllers/userController.js`
- Protected routes configured in `frontend/components/ProtectedRoute.jsx`

## 🤖 ML Integration
The ML service provides:
- **Single Prediction:** `POST /predict`
- **Batch Predictions:** `POST /batch-predict`
- **Health Check:** `GET /health`

Backend communicates with ML service via HTTP requests (typically `http://localhost:5000`)

## 📋 Available Routes

### Admin Routes
- `GET/POST /api/admin/dashboard` - Admin dashboard data
- `GET/POST /api/admin/users` - User management
- `GET/POST /api/admin/leave` - Leave management

### Employee Routes
- `GET /api/employee/dashboard` - Employee dashboard
- `GET/POST /api/employee/leave` - Leave requests
- `GET /api/employee/tasks` - Task assignments

### Manager Routes
- `GET /api/manager/dashboard` - Manager dashboard
- `GET/POST /api/manager/tasks` - Task management
- `GET/POST /api/manager/leave` - Leave approval

## 🛠 Development Tips

### Running All Services
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - ML Service
cd ml_service && python app.py
```

### Environment Variables
- **Backend:** Configure in `backend/config/database.js`
- **Frontend:** Use `.env` in frontend folder
- **ML Service:** Use `.env` in ml_service folder (template: `.env.example`)

### Database Initialization
- Configure database connection in `backend/config/database.js`
- Ensure database server is running
- Run migrations if needed

## 📝 Documentation
- **Frontend:** See `frontend/README.md`
- **Backend:** See `backend/` folder structure
- **ML Service:** See `ml_service/README.md`

## 🔗 API Documentation
API endpoints are documented in respective README files:
- Backend APIs: `backend/routes/`
- ML Service APIs: `ml_service/README.md`

## 🐛 Troubleshooting

### Backend Port Already in Use
```bash
# Find and kill process on port 3000/8080
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### ML Service Connection Issues
- Ensure ML service is running on the configured port
- Check backend configuration for ML service URL
- Verify firewall allows communication between services

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📦 Technology Stack

### Frontend
- **Framework:** React.js
- **Build Tool:** Vite
- **Styling:** CSS/CSS Modules

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL/PostgreSQL

### ML Service
- **Language:** Python
- **Framework:** Flask
- **ML Library:** scikit-learn

## 👥 User Roles

1. **Admin**
   - Manage users and permissions
   - Oversee leave management
   - View system analytics

2. **Manager**
   - Manage team tasks
   - Approve leave requests
   - View manager dashboard

3. **Employee**
   - Submit leave requests
   - View assigned tasks
   - Access personal dashboard

## 📞 Support & Contribution
For issues or contributions, please create a pull request or issue in the repository.

---

**Last Updated:** May 2026
**Version:** 1.0.0
