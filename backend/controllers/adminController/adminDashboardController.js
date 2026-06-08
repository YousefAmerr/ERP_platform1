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
    getOpenAlertsList,
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
            openAlerts,
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
            getOpenAlertsList(),
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
            openAlerts,
            pendingLeaveCount,
            pendingLeave,
            pendingLeaveMore,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching dashboard stats' })
    }
}
