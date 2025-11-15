/**
 * Authentication Controllers
 */

import type { Request, Response, NextFunction } from 'express';
import { asyncHandler, successResponse, ConflictError, AuthenticationError, InvalidTokenError } from '@cybersec/utils';
import { createLogger } from '@cybersec/utils';
import { LogLevel, ErrorCode } from '@cybersec/types';
import prisma from '../lib/prisma.js';
import {
    hashPassword,
    comparePassword,
    generateToken,
    generateRefreshToken,
    verifyToken,
    generateVerificationToken,
    generateResetToken,
} from '../lib/auth-utils.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    resetPasswordSchema,
    forgotPasswordSchema,
} from '../schemas/auth.schemas.js';

const logger = createLogger({
    service: 'auth-controller',
    level: LogLevel.INFO,
    pretty: process.env.NODE_ENV === 'development'
});

// Helper functions to parse user agent
function extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
}

function extractOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
}

export const register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    logger.info('Registration attempt', { email: req.body.email });

    const validatedData = registerSchema.parse(req.body);
    const { email, password, username, name } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        logger.warn('Registration failed - email already exists', { email });
        throw new ConflictError('Email already registered');
    }

    if (username) {
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            logger.warn('Registration failed - username already exists', { username });
            throw new ConflictError('Username already taken');
        }
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            username,
            name,
            passwordHash,
            verificationToken,
        },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate tokens for auto-login
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    // Create session
    await prisma.session.create({
        data: {
            userId: user.id,
            token,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'USER_REGISTERED',
            resource: 'USER',
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    const { data, statusCode } = successResponse({
        message: 'Registration successful.',
        user,
        token,
        refreshToken,
        verificationToken, // In production, send this via email instead
    }, 201);

    res.status(statusCode).json(data);
});

export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    logger.info('Login attempt', { email: req.body.email });

    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.passwordHash) {
        logger.warn('Login failed - invalid credentials', { email });
        throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
        logger.warn('Login failed - incorrect password', { email });
        throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    // Create session
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            token,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    // Parse user agent to extract browser and OS info
    const userAgent = req.headers['user-agent'] || '';
    const browser = extractBrowser(userAgent);
    const os = extractOS(userAgent);

    // Create login history entry
    await prisma.loginHistory.create({
        data: {
            userId: user.id,
            ipAddress: req.ip || 'unknown',
            browser,
            os,
            // In production, you would use a geolocation service to get these
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            isp: 'Unknown',
        },
    });

    // Keep only last 10 login history entries
    const allHistory = await prisma.loginHistory.findMany({
        where: { userId: user.id },
        orderBy: { loggedInAt: 'desc' },
        select: { id: true },
    });

    if (allHistory.length > 10) {
        const toDelete = allHistory.slice(10).map((h: { id: string }) => h.id);
        await prisma.loginHistory.deleteMany({
            where: { id: { in: toDelete } },
        });
    }

    logger.info('User logged in successfully', { userId: user.id, sessionId: session.id });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'USER_LOGGED_IN',
            resource: 'SESSION',
            details: { sessionId: session.id },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    const { data, statusCode } = successResponse({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
        },
        token,
        refreshToken,
    });

    res.status(statusCode).json(data);
});

export const logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        // Delete session
        await prisma.session.deleteMany({
            where: { token },
        });

        logger.info('User logged out', { token: token.substring(0, 10) + '...' });
    }

    const { data, statusCode } = successResponse({
        message: 'Logout successful',
    });

    res.status(statusCode).json(data);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const validatedData = refreshTokenSchema.parse(req.body);
    const { refreshToken: oldRefreshToken } = validatedData;

    logger.info('Token refresh attempt');

    // Find session
    const session = await prisma.session.findUnique({
        where: { refreshToken: oldRefreshToken },
        include: { user: true },
    });

    if (!session) {
        logger.warn('Token refresh failed - invalid refresh token');
        throw new InvalidTokenError('Invalid refresh token');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
        logger.warn('Token refresh failed - session expired', { sessionId: session.id });
        await prisma.session.delete({ where: { id: session.id } });
        throw new InvalidTokenError('Session expired');
    }

    // Generate new tokens
    const newToken = generateToken({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
    });
    const newRefreshToken = generateRefreshToken(session.user.id);

    // Update session
    await prisma.session.update({
        where: { id: session.id },
        data: {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    logger.info('Token refreshed successfully', { userId: session.user.id });

    const { data, statusCode } = successResponse({
        message: 'Token refreshed',
        token: newToken,
        refreshToken: newRefreshToken,
    });

    res.status(statusCode).json(data);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.body;

    logger.info('Email verification attempt');

    const user = await prisma.user.findFirst({
        where: { verificationToken: token },
    });

    if (!user) {
        logger.warn('Email verification attempt with invalid token');
        throw new InvalidTokenError('Invalid verification token');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
        },
    });

    logger.info('Email verified successfully', { userId: user.id });

    const { data, statusCode } = successResponse({
        message: 'Email verified successfully',
    });

    res.status(statusCode).json(data);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    logger.info('Password reset request', { email });

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Don't reveal if email exists
        logger.info('Password reset requested for non-existent email', { email });
        const { data, statusCode } = successResponse({
            message: 'If the email exists, a reset link has been sent',
        });
        return res.status(statusCode).json(data);
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpiry,
        },
    });

    logger.info('Password reset token generated', { userId: user.id });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            resource: 'USER',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    const { data, statusCode } = successResponse({
        message: 'Password reset link sent to your email',
        resetToken, // In production, send this via email instead
    });

    res.status(statusCode).json(data);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    logger.info('Password reset attempt');

    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gt: new Date() },
        },
    });

    if (!user) {
        logger.warn('Password reset failed - invalid or expired token');
        throw new InvalidTokenError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
        where: { userId: user.id },
    });

    logger.info('Password reset successfully', { userId: user.id });

    // Log audit
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PASSWORD_RESET_COMPLETED',
            resource: 'USER',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        },
    });

    const { data, statusCode } = successResponse({
        message: 'Password reset successful',
    });

    res.status(statusCode).json(data);
});

export const githubOAuth = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    logger.info('GitHub OAuth initiated');

    const { data, statusCode } = successResponse({
        message: 'GitHub OAuth endpoint - to be implemented',
    });

    res.status(statusCode).json(data);
});

export const githubOAuthCallback = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    logger.info('GitHub OAuth callback', { query: req.query });

    const { data, statusCode } = successResponse({
        message: 'GitHub OAuth callback endpoint - to be implemented',
        query: req.query,
    });

    res.status(statusCode).json(data);
});

export const googleOAuth = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    logger.info('Google OAuth initiated');

    const { data, statusCode } = successResponse({
        message: 'Google OAuth endpoint - to be implemented',
    });

    res.status(statusCode).json(data);
});

export const googleOAuthCallback = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    logger.info('Google OAuth callback', { query: req.query });

    const { data, statusCode } = successResponse({
        message: 'Google OAuth callback endpoint - to be implemented',
        query: req.query,
    });

    res.status(statusCode).json(data);
});
