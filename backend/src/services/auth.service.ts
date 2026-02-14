import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { createAppError } from '../middleware/error-handler.middleware';

export class AuthService {
    async register(data: { email: string; password: string; role?: string; firstName?: string; lastName?: string }) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw createAppError('User with this email already exists', 409);
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: (data.role as any) || 'student',
                firstName: data.firstName,
                lastName: data.lastName,
            },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
        });

        const tokens = this.generateTokens(user);
        return { user, ...tokens };
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw createAppError('Invalid email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw createAppError('Invalid email or password', 401);
        }

        const tokens = this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            ...tokens,
        };
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true, updatedAt: true },
        });
        if (!user) {
            throw createAppError('User not found', 404);
        }
        return user;
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; email: string; role: string };
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true },
            });

            if (!user) {
                throw createAppError('User not found', 404);
            }

            return this.generateTokens(user);
        } catch (error) {
            throw createAppError('Invalid refresh token', 401);
        }
    }

    private generateTokens(user: { id: string; email: string; role: string }) {
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRE as any }
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRE as any }
        );

        return { accessToken, refreshToken };
    }
}

export const authService = new AuthService();
