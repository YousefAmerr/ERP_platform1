import {
    getTotalEmployees,
    getTotalManagers,
    getOpenTasksCount,
    getOverdueTasksCount,
    getNeedHelpAlertsCount,
    getRecognitionAlertsCount,
    getTurnoverAlertsCount,
    getPendingLeaveCount,
    getPendingLeaveList,
} from '../../models/adminModel/admin_dashboard_model.js'

export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalEmployees,
            totalManagers,
            openTasks,
            overdueTasks,
            needHelpAlerts,
            recognitionAlerts,
            turnoverAlerts,
            pendingLeaveCount,
            pendingLeave,
        ] = await Promise.all([
            getTotalEmployees(),
            getTotalManagers(),
            getOpenTasksCount(),
            getOverdueTasksCount(),
            getNeedHelpAlertsCount(),
            getRecognitionAlertsCount(),
            getTurnoverAlertsCount(),
            getPendingLeaveCount(),
            getPendingLeaveList(),
        ])

        res.status(200).send({
            success: true,
            totalEmployees,
            totalManagers,
            openTasks,
            overdueTasks,
            needHelpAlerts,
            recognitionAlerts,
            turnoverAlerts,
            pendingLeaveCount,
            pendingLeave,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching dashboard stats' })
    }
}
