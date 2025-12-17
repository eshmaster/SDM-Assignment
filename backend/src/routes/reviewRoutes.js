import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { listReviews, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'staff']), asyncHandler(listReviews));
router.post('/', authenticate, authorize(['guest']), asyncHandler(createReview));

export default router;
