import { Router } from 'express';
import authRoutes from './authRoutes.js';
import roomRoutes from './roomRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import taskRoutes from './taskRoutes.js';
import statsRoutes from './admin/statsRoutes.js';
import serviceRequestRoutes from './serviceRequestRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import billingRoutes from './billingRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/vendors', vendorRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin/stats', statsRoutes);
router.use('/requests', serviceRequestRoutes);
router.use('/reviews', reviewRoutes);
router.use('/billing', billingRoutes);

export default router;
