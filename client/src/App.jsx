import './App.css'
import { Routes,Route } from 'react-router'
import Login from './pages/auth/login.jsx'
import {Toaster} from "react-hot-toast"
import AdminDashboard from './pages/dashboard/admin_dashboard.jsx';
import ManagerDashboard from './pages/dashboard/manager_dashboard.jsx';
import EmployeeDashboard from './pages/dashboard/employee_dashboard.jsx';

function App() {

  return (
    <>
    <Toaster/>
      <Routes>
        
        <Route path="/" element={<Login/>}/>
        <Route path="/admin_dashboard" element={<AdminDashboard/>}/>
        <Route path="/employee_dashboard" element={<EmployeeDashboard/>}/>
        <Route path="/manager_dashboard" element={<ManagerDashboard/>}/>


      </Routes>
    </>
  )
}

export default App
