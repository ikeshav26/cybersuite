/**
 * Authentication Service Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createLogger } from '@cybersec/utils';
import { getConfig } from '@cybersec/config';
import { LogLevel } from '@cybersec/types';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import apiKeyRoutes from './routes/api-key.routes.js';

const config = getConfig();
const logger = createLogger({
    service: 'auth-service',
    level: (config.logging.level as LogLevel) || LogLevel.INFO,
    pretty: config.app.env === 'development',
}); const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger(logger));

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// Error handling
app.use(errorHandler(logger));

// Start server
const port = parseInt(process.env.PORT || '3001', 10);
app.listen(port, () => {
    logger.info(`Auth service listening on port ${port}`, {
        environment: config.app.env,
        port,
    });
}); export default app;
