import express from 'express';
import { getRecognitions } from '../../controllers/recognitionController.js';

const router = express.Router();

// GET /api/recognition/
router.get('/', getRecognitions);

export default router;
