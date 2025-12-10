/**
 * Authentication Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '@cybersec/utils';
import type { User, UserRole } from '@cybersec/types';
import { verifyToken } from '../lib/auth-utils.js';
import type { JWTPayload } from '../lib/auth-utils.js';

export interface AuthRequest extends Request {
  user?: Partial<User> & { id: string; email: string; role: UserRole };
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

    // prefer to use our verifyToken helper which returns a consistent JWTPayload
    // so we avoid casting jwt.verify output directly to session shapes
    const decoded = verifyToken(token) as JWTPayload | null;
    if (!decoded) {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Attach minimal user info to request for downstream handlers
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
    };
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
