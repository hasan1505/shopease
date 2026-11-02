import { Router } from 'express';
import { getDashboardStats, getUsers } from '../controllers/orderController';
import { updateProfile } from '../controllers/authController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getUsers);
router.put('/profile', protect, updateProfile);

export default router;
