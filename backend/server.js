import express from 'express'
import 'colors'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import {connectDB} from './config/database.js'
import morgan from 'morgan'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import UserRoute from './routes/UserRoute.js'
import AdminDashboardRoute from './routes/adminRoute/AdminDashboardRoute.js'
import UsersManagementRoute from './routes/adminRoute/UsersManagementRoute.js'
import LeaveManagementRoute from './routes/adminRoute/LeaveManagementRoute.js'
import ManagerDashboardRoute from './routes/managerRoute/ManagerDashboardRoute.js'
import ManagerLeaveRoute from './routes/managerRoute/ManagerLeaveRoute.js'
import ManagerTasksRoute from './routes/managerRoute/ManagerTasksRoute.js'
import ManagerInsideTaskRoute from './routes/managerRoute/ManagerInsideTaskRoute.js'
import EmployeeDashboardRoute from './routes/employeeRoute/EmployeeDashboardRoute.js'
import EmployeeLeaveRoute from './routes/employeeRoute/EmployeeLeaveRoute.js'
import EmployeeTasksRoute from './routes/employeeRoute/EmployeeTasksRoute.js'
import employeeRiskRoute from './routes/employeeRiskRoute.js';
import AlertRoute from './routes/adminRoute/AlertRoute.js'
import { initTurnoverRiskScheduler } from './utils/turnoverScheduler.js';
import recognitionRoutes from './routes/adminRoute/recognitionRoutes.js';

//check 
connectDB();

const app = express()

//middlewares
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.use('/assets', express.static(path.join(__dirname, 'assets')))


//routes
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/admin', AdminDashboardRoute)
app.use('/api/v1/admin', UsersManagementRoute)
app.use('/api/v1/admin', LeaveManagementRoute)
app.use('/api/v1/manager', ManagerDashboardRoute)
app.use('/api/v1/manager', ManagerLeaveRoute)
app.use('/api/v1/manager', ManagerTasksRoute)
app.use('/api/v1/manager', ManagerInsideTaskRoute)
app.use('/api/v1/employee', EmployeeDashboardRoute)
app.use('/api/v1/employee', EmployeeLeaveRoute)
app.use('/api/v1/employee', EmployeeTasksRoute)


// Register route
app.use('/api/admin', employeeRiskRoute);
app.use('/api/admin', AlertRoute);
app.use('/api/recognition', recognitionRoutes);

// Initialize scheduler
let turnoverScheduler = initTurnoverRiskScheduler();

// Graceful shutdown
process.on('SIGTERM', () => {
  turnoverScheduler?.stop();
  process.exit(0);
});

app.use((err,req,res,next) =>{
    console.error(err)
    res.status(500).send("smothing broke")
})


//PORT 
const PORT = process.env.PORT


app.listen(PORT, () => {
console.log(('server is running on port ' + PORT).bgCyan.white);
});


