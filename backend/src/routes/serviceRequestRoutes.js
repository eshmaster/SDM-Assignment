import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { listRequests, myRequests, createRequest, updateRequest } from '../controllers/serviceRequestController.js';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'staff']), asyncHandler(listRequests));
router.get('/me', authenticate, authorize(['guest']), asyncHandler(myRequests));
router.post('/', authenticate, authorize(['guest']), asyncHandler(createRequest));
router.put('/:id', authenticate, authorize(['admin', 'staff']), asyncHandler(updateRequest));

export default router;
