import {
    getDirectoryUsers,
    getDirectoryUsersCount,
    createUser,
    updateUser,
    setUserActive,
    deleteUserById,
    emailExists,
} from '../../models/adminModel/usersManagementModel.js'

export const getUsers = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1
        const limit = parseInt(req.query.limit) || 10
        const [users, total] = await Promise.all([
            getDirectoryUsers(page, limit),
            getDirectoryUsersCount(),
        ])
        res.status(200).send({ success: true, users, total, page, limit })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error fetching users' })
    }
}

export const addUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body
        if (!name || !email || !password || !role) {
            return res.status(400).send({ success: false, message: 'Name, email, password and role are required' })
        }
        const allowedRoles = ['EMPLOYEE', 'MANAGER']
        if (!allowedRoles.includes(role.toUpperCase())) {
            return res.status(400).send({ success: false, message: 'Role must be EMPLOYEE or MANAGER' })
        }
        if (await emailExists(email)) {
            return res.status(409).send({ success: false, message: 'Email already in use' })
        }
        const id = await createUser(name, email, phone, password, role.toUpperCase())
        res.status(201).send({ success: true, message: 'User created', userId: id })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error creating user' })
    }
}

export const editUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const { name, email, phone, role, password } = req.body
        if (!name || !email || !role) {
            return res.status(400).send({ success: false, message: 'Name, email and role are required' })
        }
        const allowedRoles = ['EMPLOYEE', 'MANAGER']
        if (!allowedRoles.includes(role.toUpperCase())) {
            return res.status(400).send({ success: false, message: 'Role must be EMPLOYEE or MANAGER' })
        }
        if (await emailExists(email, userId)) {
            return res.status(409).send({ success: false, message: 'Email already in use by another user' })
        }
        await updateUser(userId, name, email, phone, role.toUpperCase(), password)
        res.status(200).send({ success: true, message: 'User updated' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error updating user' })
    }
}

export const deactivateUser = async (req, res) => {
    try {
        await setUserActive(parseInt(req.params.id), 0)
        res.status(200).send({ success: true, message: 'User deactivated' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error deactivating user' })
    }
}

export const activateUser = async (req, res) => {
    try {
        await setUserActive(parseInt(req.params.id), 1)
        res.status(200).send({ success: true, message: 'User activated' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error activating user' })
    }
}

export const removeUser = async (req, res) => {
    try {
        await deleteUserById(parseInt(req.params.id))
        res.status(200).send({ success: true, message: 'User deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: 'Error deleting user' })
    }
}
