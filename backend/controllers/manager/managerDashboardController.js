import {
    getTeamEmployeesCount,
    getTeamTasksCount,
    getOverdueTasksCount,
    getTeamAlertsCount,
    getLeaveRequestsCount,
    getRecentCompletedTasks,
} from '../../models/manager/managerDashboardModel.js'

export async function getDashboardStats(req, res) {
    try {
        const [
            teamEmployees,
            teamTasks,
            overdueTasks,
            teamAlerts,
            leaveRequests,
        ] = await Promise.all([
            getTeamEmployeesCount(),
            getTeamTasksCount(),
            getOverdueTasksCount(),
            getTeamAlertsCount(),
            getLeaveRequestsCount(),
        ])

        res.json({ teamEmployees, teamTasks, overdueTasks, teamAlerts, leaveRequests })
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
