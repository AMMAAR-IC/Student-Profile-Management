import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            sendSuccess(res, result, 'Registration successful', 201);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            sendSuccess(res, result, 'Login successful');
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async logout(_req: Request, res: Response) {
        // With JWT, logout is handled client-side by removing the token
        sendSuccess(res, null, 'Logout successful');
    }

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getProfile(req.user!.id);
            sendSuccess(res, user);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return sendError(res, 'Refresh token is required', 400);
            const tokens = await authService.refreshToken(refreshToken);
            sendSuccess(res, tokens, 'Token refreshed');
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }
}

export const authController = new AuthController();
