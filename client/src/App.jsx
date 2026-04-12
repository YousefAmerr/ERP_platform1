import "./App.css";
import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/auth/login.jsx";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/dashboard/admin_dashboard.jsx";
import ManagerDashboard from "./pages/dashboard/manager_dashboard.jsx";
import AdminLayout from "./components/layout/adminLayout/AdminLayout.jsx";
import ManagerLayout from "./components/layout/managerLayout/ManagerLayout.jsx";
import EmployeeLayout from "./components/layout/employeeLayout/EmployeeLayout.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminLeave from "./pages/admin/AdminLeave.jsx";
import TurnoverAlerts from "./pages/admin/alerts/TurnoverAlerts.jsx";
import RecognitionAlerts from "./pages/admin/alerts/RecognitionAlerts.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ManagerLeave from "./pages/manager/ManagerLeave.jsx";
import ManagerNeedHelpAlerts from "./pages/manager/ManagerNeedHelpAlerts.jsx";
import ManagerRecognitionAlerts from "./pages/manager/ManagerRecognitionAlerts.jsx";
import ManagerTasks from "./pages/manager/ManagerTasks.jsx";
import InsideManagerTask from "./pages/manager/InsideManagerTask.jsx";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import EmployeeTasks from "./pages/employee/EmployeeTasks.jsx";
import EmployeeLeave from "./pages/employee/EmployeeLeave.jsx";
import EmployeeProjectTasks from "./pages/employee/EmployeeProjectTasks.jsx";
import EmployeeTaskDetail from "./pages/employee/EmployeeTaskDetail.jsx";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin section with shared layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route
            path="alerts"
            element={<Navigate to="alerts/turnover" replace />}
          />
          <Route path="alerts/turnover" element={<TurnoverAlerts />} />
          <Route path="alerts/recognition" element={<RecognitionAlerts />} />
          <Route path="leave" element={<AdminLeave />} />
        </Route>

        {/* Legacy redirect for old route */}
        <Route
          path="/admin_dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/employee_dashboard"
          element={<Navigate to="/employee/dashboard" replace />}
        />

        {/* Employee section with shared layout */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="tasks/:projectId" element={<EmployeeProjectTasks />} />
          <Route
            path="tasks/:projectId/task/:taskId"
            element={<EmployeeTaskDetail />}
          />
          <Route path="leave" element={<EmployeeLeave />} />
        </Route>
        {/* Manager section with shared layout */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="tasks/:id" element={<InsideManagerTask />} />
          <Route path="leave" element={<ManagerLeave />} />
          <Route
            path="alerts"
            element={<Navigate to="alerts/need-help" replace />}
          />
          <Route path="alerts/need-help" element={<ManagerNeedHelpAlerts />} />
          <Route
            path="alerts/recognition"
            element={<ManagerRecognitionAlerts />}
          />
        </Route>

        {/* Legacy redirect for old manager route */}
        <Route
          path="/manager_dashboard"
          element={<Navigate to="/manager/dashboard" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
