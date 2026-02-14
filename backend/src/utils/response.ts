import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
    };
    res.status(statusCode).json(response);
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
): void {
    const response: ApiResponse<T[]> = {
        success: true,
        data,
        message,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
    res.status(200).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500, error?: string): void {
    const response: ApiResponse = {
        success: false,
        message,
        error: error || message,
    };
    res.status(statusCode).json(response);
}
