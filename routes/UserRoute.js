import express from 'express'
import { Login } from '../controllers/userController.js'


const router = express.Router()

//login || post
router.post('/login', Login)


export default router