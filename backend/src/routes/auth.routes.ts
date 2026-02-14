import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../utils/validators';
import { authLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

export default router;
