import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}

export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }

        next();
    };
}
