/**
 * Authentication Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '@cybersec/utils';
import type { User, UserRole, Session } from '@cybersec/types';

export interface AuthRequest extends Request {
    user?: User;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthenticationError('No authentication token provided');
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as Session;
        req.body.sessionId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError('Invalid authentication token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new AuthenticationError('Authentication token expired'));
        } else {
            next(error);
        }
    }
}

export function authorize(...roles: UserRole[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return next(new AuthorizationError('Insufficient permissions'));
        }

        next();
    };
}
