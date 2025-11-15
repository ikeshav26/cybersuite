/**
 * User Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/login-history', userController.getLoginHistory);

export default router;
