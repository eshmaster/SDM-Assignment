import { Router } from 'express';
import {
  listBookings,
  myBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(listBookings));
router.get('/me', authenticate, authorize(['guest']), asyncHandler(myBookings));
router.post('/', authenticate, authorize(['guest']), asyncHandler(createBooking));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(updateBooking));
router.delete('/:id', authenticate, asyncHandler(deleteBooking));

export default router;
