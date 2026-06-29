import express from 'express';
import {
  runEvaluation,
  getEvaluations,
  getEvaluationById,
  deleteEvaluation,
} from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all evaluation routes

router.post('/run', runEvaluation);
router.get('/', getEvaluations);
router.get('/:id', getEvaluationById);
router.delete('/:id', deleteEvaluation);

export default router;
