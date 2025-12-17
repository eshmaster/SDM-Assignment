import { Router } from 'express';
import {
  listVendors,
  createVendor,
  approveVendor,
  rejectVendor,
  myProfile,
  updateProfile,
  myJobs,
  updateJobStatus,
  paymentStatement,
} from '../controllers/vendorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(listVendors));
router.post('/', authenticate, authorize(['vendor']), asyncHandler(createVendor));
router.get('/profile', authenticate, authorize(['vendor']), asyncHandler(myProfile));
router.put('/profile', authenticate, authorize(['vendor']), asyncHandler(updateProfile));
router.get('/payments/statement', authenticate, authorize(['vendor']), asyncHandler(paymentStatement));
router.put('/:id/approve', authenticate, authorize(['admin']), asyncHandler(approveVendor));
router.put('/:id/reject', authenticate, authorize(['admin']), asyncHandler(rejectVendor));
router.get('/jobs', authenticate, authorize(['vendor']), asyncHandler(myJobs));
router.put('/jobs/:id', authenticate, authorize(['vendor']), asyncHandler(updateJobStatus));

export default router;
