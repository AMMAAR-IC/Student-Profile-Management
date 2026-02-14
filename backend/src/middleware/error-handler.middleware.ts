import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}

export function notFoundHandler(_req: Request, res: Response) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
}

export function createAppError(message: string, statusCode: number): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}
