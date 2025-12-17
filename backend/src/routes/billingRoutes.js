import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { billingSummary } from '../controllers/billingController.js';

const router = Router();

router.get('/summary', authenticate, authorize(['admin']), asyncHandler(billingSummary));

export default router;
