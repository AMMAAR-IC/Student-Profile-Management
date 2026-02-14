import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { apiLimiter } from './middleware/rate-limiter.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import agentRoutes from './routes/agent.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// ───── Middleware ─────
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'development' ? '*' : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// ───── Health Check ─────
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Student Profile Management API is running',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// ───── API Routes ─────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/analytics', analyticsRoutes);

// ───── Static Uploads ─────
app.use('/uploads', express.static(env.UPLOAD_DIR));

// ───── Error Handling ─────
app.use(notFoundHandler);
app.use(errorHandler);

// ───── Start Server ─────
app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📄 Environment: ${env.NODE_ENV}`);
    logger.info(`🗃️  Database: ${env.DATABASE_URL.split('@')[1] || 'configured'}`);
    logger.info(`🤖 Ollama: ${env.OLLAMA_BASE_URL} (model: ${env.OLLAMA_MODEL})`);
});

export default app;
