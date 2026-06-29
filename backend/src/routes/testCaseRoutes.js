import express from 'express';
import {
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} from '../controllers/testCaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all testcase routes

router.route('/')
  .get(getTestCases)
  .post(createTestCase);

router.route('/:id')
  .put(updateTestCase)
  .delete(deleteTestCase);

export default router;
