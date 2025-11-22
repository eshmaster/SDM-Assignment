import { Router } from 'express';
import { stats } from '../../controllers/adminController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/errors.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(stats));

export default router;
