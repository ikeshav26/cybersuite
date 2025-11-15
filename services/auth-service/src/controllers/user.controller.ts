/**
 * User Controllers
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { asyncHandler, successResponse, NotFoundError, ValidationError, AuthenticationError } from '@cybersec/utils';
import { createLogger } from '@cybersec/utils';
import { LogLevel } from '@cybersec/types';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/auth-utils.js';
import { z } from 'zod';

const logger = createLogger({
    service: 'user-controller',
    level: LogLevel.INFO,
    pretty: process.env.NODE_ENV === 'development'
});

const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
    email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AuthenticationError('User not authenticated');
    }

    logger.info('Fetching user details', { userId });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    sessions: true,
                    apiKeys: true,
                }
            },
            loginHistory: {
                orderBy: { loggedInAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    loggedInAt: true,
                    ipAddress: true,
                    city: true,
                    region: true,
                    country: true,
                    browser: true,
                    os: true,
                    isp: true,
                },
            },
        },
    });

    if (!user) {
        logger.warn('User not found', { userId });
        throw new NotFoundError('User');
    }

    logger.info('User details fetched successfully', { userId });

    const { data, statusCode } = successResponse({
        user,
    });

    res.status(statusCode).json(data);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AuthenticationError('User not authenticated');
    }

    logger.info('Updating user profile', { userId });

    const validatedData = updateProfileSchema.parse(req.body);
    const { name, username, email } = validatedData;

    // Check if email is being changed and if it's already taken
    if (email) {
        const existingEmail = await prisma.user.findFirst({
            where: {
                email,
                id: { not: userId },
            },
        });

        if (existingEmail) {
            logger.warn('Profile update failed - email already exists', { userId, email });
            throw new ValidationError('Email already in use');
        }
    }

    // Check if username is being changed and if it's already taken
    if (username) {
        const existingUsername = await prisma.user.findFirst({
            where: {
                username,
                id: { not: userId },
            },
        });

        if (existingUsername) {
            logger.warn('Profile update failed - username already exists', { userId, username });
            throw new ValidationError('Username already taken');
        }
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(username && { username }),
            ...(email && { email, emailVerified: false }), // Require re-verification if email changed
        },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            emailVerified: true,
            updatedAt: true,
        },
    });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'PROFILE_UPDATED',
            resource: 'USER',
            details: {
                changes: validatedData,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    logger.info('Profile updated successfully', { userId });

    const { data, statusCode } = successResponse({
        message: 'Profile updated successfully',
        user: updatedUser,
    });

    res.status(statusCode).json(data);
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AuthenticationError('User not authenticated');
    }

    logger.info('Changing password', { userId });

    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            passwordHash: true,
        },
    });

    if (!user || !user.passwordHash) {
        logger.warn('Password change failed - user not found', { userId });
        throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
        logger.warn('Password change failed - invalid current password', { userId });
        throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash: newPasswordHash,
        },
    });

    // Invalidate all sessions except current one
    const currentSessionToken = req.headers.authorization?.replace('Bearer ', '');
    await prisma.session.deleteMany({
        where: {
            userId,
            token: { not: currentSessionToken },
        },
    });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'PASSWORD_CHANGED',
            resource: 'USER',
            details: {
                sessionsInvalidated: true,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    logger.info('Password changed successfully', { userId });

    const { data, statusCode } = successResponse({
        message: 'Password changed successfully. All other sessions have been logged out.',
    });

    res.status(statusCode).json(data);
});

export const getLoginHistory = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = req.body.sessionId;
    console.log("request aagi oyeeeeeee!!",userId)

    if (!userId) {
        throw new AuthenticationError('User not authenticated');
    }

    logger.info('Fetching login history', { userId });

    const loginHistory = await prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { loggedInAt: 'desc' },
        take: 10,
        select: {
            id: true,
            loggedInAt: true,
            ipAddress: true,
            city: true,
            region: true,
            country: true,
            browser: true,
            os: true,
            isp: true,
        },
    });

    logger.info('Login history fetched successfully', { userId, count: loginHistory.length });

    const { data, statusCode } = successResponse({
        loginHistory,
    });

    res.status(statusCode).json(data);
});
