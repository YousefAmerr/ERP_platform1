import {
    getTeamEmployeesCount,
    getTeamTasksCount,
    getOverdueTasksCount,
    getTeamAlertsCount,
    getLeaveRequestsCount,
    getOpenProjectsCount,
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
            openProjects,
        ] = await Promise.all([
            getTeamEmployeesCount(),
            getTeamTasksCount(),
            getOverdueTasksCount(),
            getTeamAlertsCount(),
            getLeaveRequestsCount(),
            getOpenProjectsCount(),
        ])

        res.json({ teamEmployees, teamTasks, overdueTasks, teamAlerts, leaveRequests, openProjects })
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
