import {
    getTotalEmployees,
    getTotalManagers,
    getOpenTasksCount,
    getNeedHelpAlertsCount,
    getRecognitionAlertsCount,
    getTurnoverAlertsCount,
    getActiveProjectsCount,
    getPendingLeaveCount,
    getPendingLeaveList,
} from '../../models/adminModel/admin_dashboard_model.js'

export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalEmployees,
            totalManagers,
            openTasks,
            needHelpAlerts,
            recognitionAlerts,
            turnoverAlerts,
            activeProjects,
            pendingLeaveCount,
            pendingLeaveRows,
        ] = await Promise.all([
            getTotalEmployees(),
            getTotalManagers(),
            getOpenTasksCount(),
            getNeedHelpAlertsCount(),
            getRecognitionAlertsCount(),
            getTurnoverAlertsCount(),
            getActiveProjectsCount(),
            getPendingLeaveCount(),
            getPendingLeaveList(),
        ])

        const pendingLeave = pendingLeaveRows.slice(0, 10)
        const pendingLeaveMore = pendingLeaveRows.length > 10

        res.status(200).send({
            success: true,
            totalEmployees,
            totalManagers,
            openTasks,
            activeProjects,
            needHelpAlerts,
            recognitionAlerts,
            turnoverAlerts,
            pendingLeaveCount,
            pendingLeave,
            pendingLeaveMore,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching dashboard stats' })
    }
}
