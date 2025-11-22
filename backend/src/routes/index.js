import { Router } from 'express';
import authRoutes from './authRoutes.js';
import roomRoutes from './roomRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import taskRoutes from './taskRoutes.js';
import statsRoutes from './admin/statsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/vendors', vendorRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin/stats', statsRoutes);

export default router;
