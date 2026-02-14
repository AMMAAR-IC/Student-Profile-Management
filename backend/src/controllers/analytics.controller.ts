import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
    async getDashboard(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await analyticsService.getDashboard();
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async getTrends(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await analyticsService.getTrends();
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async getCohort(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await analyticsService.getCohortAnalysis();
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async getAtRisk(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await analyticsService.getAtRiskStudents();
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
}

export const analyticsController = new AnalyticsController();
