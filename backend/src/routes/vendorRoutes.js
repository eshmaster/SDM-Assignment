import { Router } from 'express';
import {
  listVendors,
  createVendor,
  approveVendor,
  rejectVendor,
  myJobs,
  updateJobStatus,
} from '../controllers/vendorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(listVendors));
router.post('/', authenticate, authorize(['vendor']), asyncHandler(createVendor));
router.put('/:id/approve', authenticate, authorize(['admin']), asyncHandler(approveVendor));
router.put('/:id/reject', authenticate, authorize(['admin']), asyncHandler(rejectVendor));
router.get('/jobs', authenticate, authorize(['vendor']), asyncHandler(myJobs));
router.put('/jobs/:id', authenticate, authorize(['vendor']), asyncHandler(updateJobStatus));

export default router;
