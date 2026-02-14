import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));
router.get('/trends', (req, res, next) => analyticsController.getTrends(req, res, next));
router.get('/cohort', (req, res, next) => analyticsController.getCohort(req, res, next));
router.get('/at-risk', (req, res, next) => analyticsController.getAtRisk(req, res, next));

export default router;
