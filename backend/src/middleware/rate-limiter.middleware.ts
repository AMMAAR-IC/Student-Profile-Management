import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for AI agent endpoints (more generous timeout, fewer requests)
export const agentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        message: 'Too many AI requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
