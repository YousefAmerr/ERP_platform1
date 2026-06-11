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
    getTaskStatusBreakdown,
    getAtRiskEmployeeCount,
    getLeaveByType,
    getActiveProjectsOverview,
    getDashboardTrends,
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
            taskStatus,
            atRiskCount,
            leaveByType,
            projectsOverview,
            trends,
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
            getTaskStatusBreakdown(),
            getAtRiskEmployeeCount(),
            getLeaveByType(),
            getActiveProjectsOverview(),
            getDashboardTrends(),
        ])

        const pendingLeave = pendingLeaveRows.slice(0, 10)
        const pendingLeaveMore = pendingLeaveRows.length > 10

        const flightRisk = {
            atRisk: atRiskCount,
            stable: Math.max(0, totalEmployees - atRiskCount),
        }

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
            taskStatus,
            flightRisk,
            leaveByType,
            projectsOverview,
            trends,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching dashboard stats' })
    }
}
