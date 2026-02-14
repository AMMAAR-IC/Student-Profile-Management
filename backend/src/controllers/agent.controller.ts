import { Request, Response, NextFunction } from 'express';
import { agentService } from '../services/ai-agent/agent.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class AgentController {
    async analyze(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.body;
            const result = await agentService.analyze(studentId, req.user!.id);
            sendSuccess(res, result, 'Analysis complete');
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async query(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { query } = req.body;
            const result = await agentService.query(query, req.user!.id);
            sendSuccess(res, result);
        } catch (error: any) {
            next(error);
        }
    }

    async recommend(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId, type } = req.body;
            const result = await agentService.recommend(studentId, type || 'all', req.user!.id);
            sendSuccess(res, result);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async processDocument(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.file) return sendError(res, 'No file uploaded', 400);
            const { studentId } = req.body;
            const result = await agentService.processDocument(req.file.path, studentId, req.user!.id);
            sendSuccess(res, result, 'Document processed');
        } catch (error: any) {
            next(error);
        }
    }

    async chat(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { message, conversationHistory } = req.body;
            const result = await agentService.chat(message, conversationHistory || [], req.user!.id);
            sendSuccess(res, result);
        } catch (error: any) {
            next(error);
        }
    }

    async getInsights(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await agentService.getInsights(req.user!.id);
            sendSuccess(res, result);
        } catch (error: any) {
            next(error);
        }
    }
}

export const agentController = new AgentController();
