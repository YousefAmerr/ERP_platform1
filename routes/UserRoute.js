import express from 'express'
import { Login, getMe } from '../controllers/userController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const router = express.Router()

//login || post
router.post('/login', Login)

// get current logged-in user (protected)
router.get('/me', requireAuth, getMe)

export default router