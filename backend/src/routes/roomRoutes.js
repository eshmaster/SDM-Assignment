import { Router } from 'express';
import { listRooms, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', asyncHandler(listRooms));
router.post('/', authenticate, authorize(['admin']), asyncHandler(createRoom));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(updateRoom));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(deleteRoom));

export default router;
