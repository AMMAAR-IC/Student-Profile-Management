import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { analyzeSchema, querySchema, chatSchema, recommendSchema } from '../utils/validators';
import { agentLimiter } from '../middleware/rate-limiter.middleware';
import { upload } from '../utils/file-upload';

const router = Router();

// All agent routes require authentication and rate limiting
router.use(authenticate);
router.use(agentLimiter);

router.post('/analyze', validate(analyzeSchema), (req, res, next) => agentController.analyze(req, res, next));
router.post('/query', validate(querySchema), (req, res, next) => agentController.query(req, res, next));
router.post('/recommend', validate(recommendSchema), (req, res, next) => agentController.recommend(req, res, next));
router.post('/process-document', upload.single('file'), (req, res, next) => agentController.processDocument(req, res, next));
router.post('/chat', validate(chatSchema), (req, res, next) => agentController.chat(req, res, next));
router.get('/insights', (req, res, next) => agentController.getInsights(req, res, next));

export default router;
