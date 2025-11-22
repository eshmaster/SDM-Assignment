import { Router } from 'express';
import { listTasks, myTasks, createTask, updateTask } from '../controllers/taskController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(listTasks));
router.get('/me', authenticate, authorize(['staff']), asyncHandler(myTasks));
router.post('/', authenticate, authorize(['admin']), asyncHandler(createTask));
router.put('/:id', authenticate, authorize(['admin', 'staff']), asyncHandler(updateTask));

export default router;
