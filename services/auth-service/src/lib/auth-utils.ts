import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { createLogger } from '@cybersec/utils';
import { LogLevel } from '@cybersec/types';
import { Session } from 'inspector';

const logger = createLogger({
  service: 'auth-utils',
  level: LogLevel.INFO,
  pretty: true,
});

const JWT_SECRET: Secret = (process.env.JWT_SECRET ||
  'your-super-secret-jwt-key-change-in-production') as Secret;
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;
const JWT_REFRESH_EXPIRES_IN: StringValue = (process.env.JWT_REFRESH_EXPIRES_IN ||
  '30d') as StringValue;
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: UserData): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

export const generateVerificationToken = (): string => {
  return jwt.sign({ purpose: 'verification' }, JWT_SECRET, {
    expiresIn: '24h',
  });
};

export const generateResetToken = (): string => {
  return jwt.sign({ purpose: 'reset' }, JWT_SECRET, {
    expiresIn: '1h',
  });
};
