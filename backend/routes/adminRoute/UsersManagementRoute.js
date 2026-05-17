import express from 'express'
import {
    getUsers,
    addUser,
    editUser,
    deactivateUser,
    activateUser,
    removeUser,
} from '../../controllers/adminController/usersManagementController.js'
import { requireAuth } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/users',              requireAuth, getUsers)
router.post('/users',             requireAuth, addUser)
router.put('/users/:id',          requireAuth, editUser)
router.patch('/users/:id/deactivate', requireAuth, deactivateUser)
router.patch('/users/:id/activate',   requireAuth, activateUser)
router.delete('/users/:id',       requireAuth, removeUser)

export default router
