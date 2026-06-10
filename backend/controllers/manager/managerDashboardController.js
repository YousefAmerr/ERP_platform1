import {
    getTeamEmployeesCount,
    getTeamTasksCount,
    getOverdueTasksCount,
    getTeamAlertsCount,
    getNeedHelpAlertsCount,
    getLeaveRequestsCount,
    getOpenProjectsCount,
    getRecentCompletedTasks,
    getTeamTaskStatus,
    getPerformanceByEmployee,
    getProjectStatusBreakdown,
    getRecentNeedHelpAlerts,
    getCapacityPerformance,
    getUtilizationMatrix,
} from '../../models/manager/managerDashboardModel.js'

export async function getDashboardStats(req, res) {
    try {
        const [
            teamEmployees,
            teamTasks,
            overdueTasks,
            teamAlerts,
            needHelpCount,
            leaveRequests,
            openProjects,
            taskStatus,
            performanceByEmployee,
            projectStatus,
            needHelpAlerts,
            capacityPerformance,
            utilizationMatrix,
        ] = await Promise.all([
            getTeamEmployeesCount(),
            getTeamTasksCount(),
            getOverdueTasksCount(),
            getTeamAlertsCount(),
            getNeedHelpAlertsCount(),
            getLeaveRequestsCount(),
            getOpenProjectsCount(),
            getTeamTaskStatus(),
            getPerformanceByEmployee(),
            getProjectStatusBreakdown(),
            getRecentNeedHelpAlerts(),
            getCapacityPerformance(),
            getUtilizationMatrix(),
        ])

        res.json({
            teamEmployees,
            teamTasks,
            overdueTasks,
            teamAlerts,
            needHelpCount,
            leaveRequests,
            openProjects,
            taskStatus,
            performanceByEmployee,
            projectStatus,
            needHelpAlerts,
            capacityPerformance,
            utilizationMatrix,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch dashboard stats' })
    }
}

export async function getCompletedTasks(req, res) {
    try {
        const tasks = await getRecentCompletedTasks(5)
        res.json({ tasks })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch completed tasks' })
    }
}
