import {
    getLeaveStatusCounts,
    getLeaveRequests,
    getLeaveRequestsCount,
    updateLeaveStatus,
} from '../../models/adminModel/leaveManagementModel.js'

export const getLeaveStats = async (req, res) => {
    try {
        const counts = await getLeaveStatusCounts()
        res.status(200).send({ success: true, ...counts })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching leave stats' })
    }
}

export const getLeaveList = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1
        const limit = parseInt(req.query.limit) || 10
        const [requests, total] = await Promise.all([
            getLeaveRequests(page, limit),
            getLeaveRequestsCount(),
        ])
        res.status(200).send({ success: true, requests, total, page, limit })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching leave requests' })
    }
}

export const approveLeave = async (req, res) => {
    try {
        await updateLeaveStatus(parseInt(req.params.id), 'approved')
        res.status(200).send({ success: true, message: 'Leave approved' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error approving leave' })
    }
}

export const rejectLeave = async (req, res) => {
    try {
        await updateLeaveStatus(parseInt(req.params.id), 'rejected')
        res.status(200).send({ success: true, message: 'Leave rejected' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error rejecting leave' })
    }
}
